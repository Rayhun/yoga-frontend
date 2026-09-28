'use client';
import React from 'react';
import { FiAlertCircle, FiCheck, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { aggregateSaveStatus } from './saveStatus';

const QUIET_COPY = {
  idle: { text: 'Changes save automatically', className: 'text-body' },
  pending: { text: 'Unsaved changes', className: 'text-body' },
  saving: { text: 'Saving…', className: 'text-body' },
  saved: { text: 'All changes saved', className: 'text-primary' },
};

/**
 * One save status for the whole builder (card header). Each section still shows its own inline
 * error under its heading; this is the summary that's always in view. On a failure it names the
 * section, offers Retry when re-sending can help (not after a 409), and "Show" jumps to it.
 * Announced politely to screen readers.
 */
const SaveStatusIndicator = ({ sections, onShowSection }) => {
  const { status, failed } = aggregateSaveStatus(sections);
  const [firstFailed] = failed;
  const retryable = failed.filter(section => section.canRetry);

  return (
    <div aria-live="polite" className="flex min-h-[2rem] flex-wrap items-center justify-end gap-2 text-sm">
      {status === 'error' && firstFailed ? (
        <>
          <span className="flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400">
            <FiAlertCircle aria-hidden size={15} />
            Could not save {firstFailed.label}
            {failed.length > 1 ? ` (+${failed.length - 1} more)` : ''}
          </span>
          {retryable.length ? (
            <button
              type="button"
              onClick={() => retryable.forEach(section => section.retry?.())}
              className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-700 outline-none hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400 dark:bg-transparent dark:text-red-300"
            >
              <FiRefreshCw aria-hidden size={12} /> Retry
            </button>
          ) : null}
          {onShowSection ? (
            <button
              type="button"
              onClick={() => onShowSection(firstFailed.id)}
              className="rounded-lg px-2 py-1 text-xs font-medium text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary"
            >
              Show
            </button>
          ) : null}
        </>
      ) : (
        <span className={`flex items-center gap-1.5 ${QUIET_COPY[status].className}`}>
          {status === 'saving' ? <FiLoader aria-hidden className="animate-spin" size={14} /> : null}
          {status === 'saved' ? <FiCheck aria-hidden size={14} /> : null}
          {QUIET_COPY[status].text}
        </span>
      )}
    </div>
  );
};

export default SaveStatusIndicator;
