'use client';
import { useEffect } from 'react';

/**
 * Lifts one section's `useSectionAutosave` state up to the builder (for the card header's global
 * save status) without changing the hook itself. `onStatusChange` is optional and must be stable.
 */
const useReportSaveStatus = (onStatusChange, { status, errorMessage, canRetry, retry }) => {
  useEffect(() => {
    onStatusChange?.({ status, errorMessage, canRetry, retry });
  }, [onStatusChange, status, errorMessage, canRetry, retry]);
};

export default useReportSaveStatus;
