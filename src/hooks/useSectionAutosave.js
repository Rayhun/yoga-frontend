'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import isEqual from 'lodash/isEqual';

const AUTOSAVE_DELAY_MS = 700;

// A readable message for the inline "Could not save" state: the API's `message` when it sends one,
// otherwise the first field error in a DRF validation body (possibly nested, e.g. modules[0].lessons),
// otherwise the network/axios message (e.g. backend unreachable).
const firstErrorString = data => {
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.map(firstErrorString).find(Boolean) || null;
  if (data && typeof data === 'object') return Object.values(data).map(firstErrorString).find(Boolean) || null;
  return null;
};

export const describeSaveError = error => {
  const data = error?.response?.data;
  if (typeof data?.message === 'string' && data.message) return data.message;
  if (!error?.response) return 'Could not reach the server. Check your connection and retry.';
  return firstErrorString(data) || error?.message || 'Could not save.';
};

/**
 * Section-level autosave-on-blur for the Program Builder (KAN-90) — every builder section
 * (Basics, Delivery, and Curriculum/Pricing/Certificate Setup in later passes) uses this same
 * hook so they all get identical save-timing/status/data-safety behavior.
 *
 * Mirrors `useDebouncedCallback`'s timer primitive but adds three guarantees a form autosave
 * needs that a plain debounced callback doesn't: (1) skips the network call entirely when
 * nothing actually changed since the last save (tabbing through fields without editing), (2)
 * flushes any pending save on unmount so navigating away mid-debounce doesn't drop the last
 * edit, (3) exposes a status so the section can show "Saving…"/"Saved" feedback.
 *
 * Usage: call `notifyBlur(values)` from a section's onBlur handler (React bubbles onBlur, so
 * one handler on the section's outer <Form> catches blur from any field inside it — tabbing
 * through several fields fires one save after the last blur, not one per field).
 */
function useSectionAutosave(onSave, { isRetryable = () => true } = {}) {
  const [status, setStatus] = useState('idle'); // idle | pending | saving | saved | error
  // Set alongside status 'error': what went wrong, and whether re-sending the same values makes
  // sense (a 409 conflict, say, won't succeed on retry).
  const [saveError, setSaveError] = useState(null); // { message, canRetry } | null
  const timerRef = useRef(null);
  const lastSavedRef = useRef(undefined);
  const pendingValuesRef = useRef(undefined);
  const onSaveRef = useRef(onSave);
  const isRetryableRef = useRef(isRetryable);
  const mountedRef = useRef(true);

  onSaveRef.current = onSave;
  isRetryableRef.current = isRetryable;

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  const safeSetStatus = useCallback(next => {
    if (mountedRef.current) setStatus(next);
  }, []);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const values = pendingValuesRef.current;
    if (values === undefined || isEqual(values, lastSavedRef.current)) {
      return;
    }
    safeSetStatus('saving');
    try {
      await onSaveRef.current(values);
      lastSavedRef.current = values;
      if (mountedRef.current) setSaveError(null);
      safeSetStatus('saved');
    } catch (error) {
      if (mountedRef.current) {
        setSaveError({ message: describeSaveError(error), canRetry: isRetryableRef.current(error) });
      }
      safeSetStatus('error');
      throw error;
    }
  }, [safeSetStatus]);

  // Re-send the values whose save failed (they're still pending). Errors stay in status/saveError.
  const retry = useCallback(() => flush().catch(() => null), [flush]);

  const notifyBlur = useCallback(
    values => {
      pendingValuesRef.current = values;
      if (isEqual(values, lastSavedRef.current)) {
        return; // nothing dirty — don't schedule a no-op save
      }
      safeSetStatus('pending');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        // Nothing awaits a timer-driven save — a failure is already surfaced via status 'error'
        // (and by the section's own onSave, e.g. the Curriculum 409 toast), so don't let it
        // escape as an unhandled promise rejection.
        flush().catch(() => null);
      }, AUTOSAVE_DELAY_MS);
    },
    [flush, safeSetStatus]
  );

  // Marks a values snapshot as the current baseline without hitting the network — call once
  // right after initial load/create so the first incidental blur doesn't re-save unchanged data.
  const markSaved = useCallback(values => {
    lastSavedRef.current = values;
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        // Best-effort: fire the last pending save so closing/navigating away mid-debounce
        // doesn't lose the edit. The network request itself isn't tied to component lifecycle,
        // so this still lands even though the component is gone by the time it resolves.
        flush().catch(() => null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    notifyBlur,
    flush,
    markSaved,
    retry,
    status,
    errorMessage: status === 'error' ? saveError?.message ?? null : null,
    canRetry: status === 'error' && Boolean(saveError?.canRetry),
  };
}

export default useSectionAutosave;
