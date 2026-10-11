'use client';
import Spinner from '@/components/common/loader/Spinner';
import MarkAsDoneButton from '../MarkAsDoneButton';
import { MEDIA_STATUS, useMediaRetry } from '../mediaRetry';
import MediaLoadError from './MediaLoadError';

/**
 * An uploaded image, shown from the lesson's freshly signed `content_url` (responsive; the picture opens at full
 * size in a new tab). An expired link is refreshed once (`reloadLesson`), then a retry button is offered.
 * Completion is the usual manual "Mark as done".
 */
const ImageLesson = ({ lesson, programId, reloadLesson }) => {
  const { state, onError, onLoad, retry } = useMediaRetry(reloadLesson);

  if (!lesson.content_url) {
    return <p className="p-8 text-center text-gray-500">This image isn&apos;t available yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {state.status === MEDIA_STATUS.failed ? (
        <MediaLoadError what="image" onRetry={retry} />
      ) : state.status === MEDIA_STATUS.reloading ? (
        <div role="status" className="flex items-center gap-3 py-6 text-gray-600">
          <Spinner /> Refreshing the image…
        </div>
      ) : (
        <a
          href={lesson.content_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open “${lesson.title}” at full size in a new tab`}
          className="block min-h-[44px] self-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- a signed, expiring storage URL, not a Next-optimised asset */}
          <img
            key={`${state.attempt}:${lesson.content_url}`}
            src={lesson.content_url}
            alt={lesson.title}
            className="h-auto max-h-[70vh] w-full max-w-full rounded-lg object-contain"
            onError={onError}
            onLoad={onLoad}
          />
        </a>
      )}
      <div className="flex flex-wrap items-center justify-end gap-4">
        <MarkAsDoneButton programId={programId} lesson={lesson} />
      </div>
    </div>
  );
};

export default ImageLesson;
