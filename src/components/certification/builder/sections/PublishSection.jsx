'use client';
import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import SectionCard from '@/components/certification/builder/SectionCard';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Public' },
];

/**
 * Draft/Private/Public — a discrete choice, not a text field, so it saves immediately on click
 * rather than on blur (there's no meaningful "blur" moment for a button row). Backend rejects
 * moving out of 'draft' while any required section is incomplete and returns per-section
 * messages (e.g. {"delivery": "Delivery format is required."}) — rendered inline here per the
 * acceptance criteria ("shows the specific missing section inline, not a generic error toast").
 */
const PublishSection = ({ currentStatus, onPublish, disabled = false }) => {
  const [pendingStatus, setPendingStatus] = useState(null);
  const [sectionErrors, setSectionErrors] = useState(null);

  const handleSelect = useCallback(
    async value => {
      if (value === currentStatus || disabled) return;
      setPendingStatus(value);
      setSectionErrors(null);
      try {
        await onPublish(value);
        toast.success(value === 'draft' ? 'Moved back to draft' : `Program is now ${value}`);
      } catch (error) {
        const data = error?.response?.data;
        if (data?.data && typeof data.data === 'object') {
          setSectionErrors(data.data);
        } else {
          toast.error(data?.message || 'Something went wrong.');
        }
      } finally {
        setPendingStatus(null);
      }
    },
    [currentStatus, disabled, onPublish]
  );

  return (
    <SectionCard title="Publish" subtitle="Draft is only visible to you; Private is reachable by direct link; Public appears in the catalog.">
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(option => (
          <button
            key={option.value}
            type="button"
            disabled={disabled || pendingStatus !== null}
            onClick={() => handleSelect(option.value)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
              currentStatus === option.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-300 text-gray-600 dark:border-strokedark dark:text-gray-300'
            }`}
          >
            {pendingStatus === option.value ? 'Saving…' : option.label}
          </button>
        ))}
      </div>

      {sectionErrors ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700 mb-1">This program isn&apos;t ready to publish yet:</p>
          <ul className="list-disc pl-5 text-sm text-red-600">
            {Object.entries(sectionErrors).map(([section, message]) => (
              <li key={section}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </SectionCard>
  );
};

export default PublishSection;
