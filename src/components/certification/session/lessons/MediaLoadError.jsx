import Button from '@/components/common/Button';

// Shown when an audio / image could not be loaded even after the lesson was refreshed once.
const MediaLoadError = ({ what, onRetry, isRetrying = false }) => (
  <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-strokedark dark:bg-gray-800">
    <p className="text-gray-700 dark:text-gray-200">This {what} couldn&apos;t be loaded right now. Check your connection and try again.</p>
    <Button type="button" className="min-h-[44px]" isLoading={isRetrying} disabled={isRetrying} onClick={onRetry}>
      Try again
    </Button>
  </div>
);

export default MediaLoadError;
