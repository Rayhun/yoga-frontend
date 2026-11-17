'use client';
import React from 'react';
import { FiAlertTriangle, FiCheck } from 'react-icons/fi';

/**
 * The Publish step's readiness checklist. `blockers` are the checks the server enforces (see readiness.js);
 * `recommendations` are advisory lesson gaps. Every item that needs work has a "Fix" button that calls
 * `onGoTo(item.target)` — the exact Basics part / Content tab / lesson that resolves it.
 */
const FixButton = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="shrink-0 rounded-md border border-primary px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
  >
    {label}
  </button>
);

const PublishChecklist = ({ blockers = [], recommendations = [], onGoTo }) => {
  const remaining = blockers.filter(item => !item.ok).length;

  return (
    <div data-testid="publish-checklist" className="mb-6">
      <p className="mb-2 text-sm font-medium text-black dark:text-white" role="status">
        {remaining === 0 ? 'Everything required is complete.' : `${remaining} required ${remaining === 1 ? 'item needs' : 'items need'} attention before this program can go Private or Public.`}
      </p>
      <ul className="flex flex-col gap-2">
        {blockers.map(item => (
          <li
            key={item.id}
            data-check-id={item.id}
            data-check-ok={item.ok ? 'true' : 'false'}
            className="flex items-start justify-between gap-3 rounded-lg border border-stroke px-3 py-2 text-sm dark:border-strokedark"
          >
            <span className="flex min-w-0 items-start gap-2">
              {item.ok ? (
                <FiCheck aria-hidden className="mt-0.5 shrink-0 text-primary" />
              ) : (
                <FiAlertTriangle aria-hidden className="mt-0.5 shrink-0 text-amber-500" />
              )}
              <span>
                <span className="font-medium">{item.label}</span>
                <span className="sr-only">{item.ok ? ': complete' : ': needs attention'}</span>
                {item.ok ? null : <span className="block text-gray-600 dark:text-gray-300">{item.message}</span>}
              </span>
            </span>
            {item.ok ? null : <FixButton label={`Fix ${item.label}`} onClick={() => onGoTo(item.target)} />}
          </li>
        ))}
      </ul>

      {recommendations.length ? (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-black dark:text-white">Recommended before you publish</p>
          <ul className="flex flex-col gap-2">
            {recommendations.map(item => (
              <li
                key={item.id}
                data-recommendation-id={item.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-stroke px-3 py-2 text-sm dark:border-strokedark"
              >
                <span className="text-gray-600 dark:text-gray-300">{item.message}</span>
                <FixButton label="Open lesson" onClick={() => onGoTo(item.target)} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default PublishChecklist;
