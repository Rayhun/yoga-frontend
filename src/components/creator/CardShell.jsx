'use client';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';

const CARD_CLASSES =
  'min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6';

/**
 * A dashboard card with its own title, loading skeleton and error state (with a retry button), so one
 * card failing never blanks the page. `loading` / `error` win over `children`.
 */
const CardShell = ({ title, subtitle, loading, error, onRetry, skeletonLines = 4, className = '', children }) => (
  <section className={`${CARD_CLASSES} ${className}`}>
    {title ? (
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
    ) : null}
    {subtitle ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p> : null}

    <div className="mt-3">
      {loading ? (
        <div role="status" aria-label="Loading" className="flex flex-col gap-2">
          {Array.from({ length: skeletonLines }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={22} />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-start gap-3 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">Couldn&apos;t load this section.</p>
          <Button variant="outlined" size="small" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : (
        children
      )}
    </div>
  </section>
);

export default CardShell;
