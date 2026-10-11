'use client';
// Signed media links expire (about an hour). When the browser can't load an audio / image, the lesson is
// refetched ONCE (a fresh signed link) and the media is tried again; if it still fails, a friendly error with a
// retry button is shown. The rules live here, away from React, so they can be tested directly:
//
//   ok --error--> reloading --(refetch done)--> ok (remounted, new link)
//   ok --error again--> failed --retry--> reloading ...
//   a successful load re-arms the automatic retry (a lesson left open for hours can recover again).
import { useRef, useSyncExternalStore } from 'react';

export const MEDIA_STATUS = { ok: 'ok', reloading: 'reloading', failed: 'failed' };

export const createMediaRetry = ({ reload }) => {
  let state = { status: MEDIA_STATUS.ok, autoRetried: false, attempt: 0 };
  const listeners = new Set();
  const set = patch => {
    state = { ...state, ...patch };
    listeners.forEach(listener => listener());
  };

  const reloadThenRemount = async () => {
    set({ status: MEDIA_STATUS.reloading });
    try {
      await reload();
    } catch (error) {
      // the remount below fails again if the link is still bad, which lands on "failed"
    }
    set({ status: MEDIA_STATUS.ok, attempt: state.attempt + 1 });
  };

  return {
    // The media element reported an error.
    error: async () => {
      if (state.status === MEDIA_STATUS.reloading) return;
      if (state.autoRetried) {
        set({ status: MEDIA_STATUS.failed });
        return;
      }
      set({ autoRetried: true });
      await reloadThenRemount();
    },
    // The media loaded.
    loaded: () => {
      if (state.status === MEDIA_STATUS.ok && state.autoRetried) set({ autoRetried: false });
    },
    // The "Try again" button.
    retry: async () => {
      if (state.status === MEDIA_STATUS.reloading) return;
      set({ autoRetried: true });
      await reloadThenRemount();
    },
    getState: () => state,
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export const useMediaRetry = reload => {
  const reloadRef = useRef(reload);
  reloadRef.current = reload;
  const controllerRef = useRef(null);
  if (!controllerRef.current) controllerRef.current = createMediaRetry({ reload: () => reloadRef.current?.() });
  const controller = controllerRef.current;
  const state = useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);
  return { state, onError: controller.error, onLoad: controller.loaded, retry: controller.retry };
};
