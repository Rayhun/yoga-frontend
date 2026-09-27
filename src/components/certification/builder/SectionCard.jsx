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
 * Shared chrome for every Program Builder section (Basics, Delivery, Publish, and
 * Curriculum/Pricing/Certificate Setup in later passes) — title, subtitle, and a save-status
 * indicator fed by `useSectionAutosave`'s `status`. On a failed save the reason (`errorMessage`)
 * is shown inline under the header with a Retry button (when `canRetry`), so a failure is never
 * just a small status label. Keeping this in one place so all sections behave identically.
 */
const SectionCard = ({ title, subtitle, status, errorMessage, canRetry = false, onRetry, children }) => {
  const statusInfo = STATUS_COPY[status];

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
          {subtitle ? <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p> : null}
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
