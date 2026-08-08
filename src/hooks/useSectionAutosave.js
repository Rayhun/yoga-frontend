'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import isEqual from 'lodash/isEqual';

const AUTOSAVE_DELAY_MS = 700;

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
function useSectionAutosave(onSave) {
  const [status, setStatus] = useState('idle'); // idle | pending | saving | saved | error
  const timerRef = useRef(null);
  const lastSavedRef = useRef(undefined);
  const pendingValuesRef = useRef(undefined);
  const onSaveRef = useRef(onSave);
  const mountedRef = useRef(true);

  onSaveRef.current = onSave;

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
      safeSetStatus('saved');
    } catch (error) {
      safeSetStatus('error');
      throw error;
    }
  }, [safeSetStatus]);

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
        flush();
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
        flush();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { notifyBlur, flush, markSaved, status };
}

export default useSectionAutosave;
