'use client';
import React from 'react';
import { FiAlertCircle, FiCheck, FiLoader, FiRefreshCw } from 'react-icons/fi';

const STATUS_COPY = {
  pending: { text: 'Unsaved changes', className: 'text-gray-400' },
  saving: { text: 'Saving…', className: 'text-gray-500' },
  saved: { text: 'Saved', className: 'text-green-600' },
  error: { text: 'Not saved', className: 'text-red-600' },
};

/**
 * Shared chrome for every Program Builder section (Basics, Delivery, Curriculum, Pricing,
 * Certificate Setup, Publish) — title, subtitle, and a save-status indicator fed by
 * `useSectionAutosave`'s `status`. On a failed save the reason (`errorMessage`) is shown inline
 * under the header with a Retry button (when `canRetry`), so a failure is never just a small status
 * label. Keeping this in one place so all sections behave identically.
 *
 * Sections sit flat inside the builder's single card (LMS FormLayoutWrapper look), so this is a
 * heading row + divider rather than a card of its own. `anchorId` lets the header's save status
 * ("Show") scroll to and focus the section that failed.
 */
const SectionCard = ({ title, subtitle, status, errorMessage, canRetry = false, onRetry, anchorId, children }) => {
  const statusInfo = STATUS_COPY[status];

  return (
    <section id={anchorId} aria-labelledby={anchorId ? `${anchorId}-title` : undefined} className="scroll-mt-24">
      <div className="mb-4 flex items-start justify-between gap-4 border-b border-stroke pb-3 dark:border-strokedark">
        <div>
          <h2
            id={anchorId ? `${anchorId}-title` : undefined}
            tabIndex={-1}
            className="text-lg font-bold text-black outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-white"
          >
            {title}
          </h2>
          {subtitle ? <p className="mt-0.5 text-sm text-body dark:text-gray-400">{subtitle}</p> : null}
        </div>
        {statusInfo ? (
          <div className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${statusInfo.className}`}>
            {status === 'saving' ? <FiLoader className="animate-spin" size={13} /> : null}
            {status === 'saved' ? <FiCheck size={13} /> : null}
            <span>{statusInfo.text}</span>
          </div>
        ) : null}
      </div>
      {status === 'error' && errorMessage ? (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          <span className="flex items-start gap-2">
            <FiAlertCircle className="mt-0.5 shrink-0" />
            <span>Could not save: {errorMessage}</span>
          </span>
          {canRetry && onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-1.5 font-medium text-red-700 hover:bg-red-100 dark:bg-transparent"
            >
              <FiRefreshCw size={13} /> Retry
            </button>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
};

export default SectionCard;
