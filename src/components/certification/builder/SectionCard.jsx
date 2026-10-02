'use client';
import React from 'react';
import { FiCheck, FiLoader } from 'react-icons/fi';

const STATUS_COPY = {
  pending: { text: 'Unsaved changes', className: 'text-gray-400' },
  saving: { text: 'Saving…', className: 'text-gray-500' },
  saved: { text: 'Saved', className: 'text-green-600' },
  error: { text: 'Could not save — will retry on next change', className: 'text-red-600' },
};

/**
 * Shared chrome for every Program Builder section (Basics, Delivery, Publish, and
 * Curriculum/Pricing/Certificate Setup in later passes) — title, subtitle, and a save-status
 * indicator fed by `useSectionAutosave`'s `status`. Keeping this in one place so all sections
 * show autosave feedback identically.
 */
const SectionCard = ({ title, subtitle, status, children }) => {
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
      {children}
    </section>
  );
};

export default SectionCard;
