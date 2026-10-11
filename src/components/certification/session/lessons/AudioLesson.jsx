'use client';
import Spinner from '@/components/common/loader/Spinner';
import MarkAsDoneButton from '../MarkAsDoneButton';
import { MEDIA_STATUS, useMediaRetry } from '../mediaRetry';
import MediaLoadError from './MediaLoadError';

/**
 * An uploaded audio file, played from the lesson's freshly signed `content_url`. If the link has expired the
 * lesson is refetched once (`reloadLesson`) and the player remounted; a second failure shows a retry button.
 * Completion is the usual manual "Mark as done" (no watch tracking).
 */
const AudioLesson = ({ lesson, programId, reloadLesson }) => {
  const { state, onError, onLoad, retry } = useMediaRetry(reloadLesson);

  if (!lesson.content_url) {
    return <p className="p-8 text-center text-gray-500">This audio isn&apos;t available yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {state.status === MEDIA_STATUS.failed ? (
        <MediaLoadError what="audio" onRetry={retry} />
      ) : state.status === MEDIA_STATUS.reloading ? (
        <div role="status" className="flex items-center gap-3 py-6 text-gray-600">
          <Spinner /> Refreshing the audio…
        </div>
      ) : (
        <audio
          key={`${state.attempt}:${lesson.content_url}`}
          controls
          preload="metadata"
          src={lesson.content_url}
          aria-label={`Audio: ${lesson.title}`}
          className="w-full"
          onError={onError}
          onLoadedMetadata={onLoad}
        />
      )}
      <div className="flex flex-wrap items-center justify-end gap-4">
        <MarkAsDoneButton programId={programId} lesson={lesson} />
      </div>
    </div>
  );
};

export default AudioLesson;
