'use client';

/**
 * Read-only yes / no for `relife_index` on admin LMS detail pages only.
 * Do not use in customer-facing views — omit this field entirely there.
 */
const RelifeIndexBadge = ({ value }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      value
        ? 'bg-primary/15 text-primary'
        : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
    }`}
  >
    {value ? 'yes' : 'no'}
  </span>
);

export default RelifeIndexBadge;
