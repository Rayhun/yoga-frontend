'use client';
import { useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { debounce } from 'lodash';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const REPORT_DEBOUNCE_MS = 3000;

/**
 * ``content_url`` is any-platform (backend plan Phase 3), so no per-platform special-casing —
 * ``react-player`` already dispatches to the right underlying player for YouTube/Vimeo/direct
 * file/etc. Watch-percent is reported debounced (not on every ``onProgress`` tick) so a full
 * watch-through doesn't spam ``POST /lessons/{id}/complete/``; once the lesson is already marked
 * complete (``lesson.progress?.completed_at``) reporting stops entirely.
 */
const VideoLesson = ({ lesson, onComplete, isSubmitting }) => {
  const highestReportedRef = useRef(0);
  const isCompleted = Boolean(lesson.progress?.completed_at);

  const debouncedReport = useMemo(
    () =>
      debounce(percent => {
        onComplete({ watch_percent: percent });
      }, REPORT_DEBOUNCE_MS),
    [onComplete]
  );

  const handleProgress = ({ played }) => {
    if (isCompleted) return;
    const percent = Math.round(played * 100);
    if (percent <= highestReportedRef.current) return;
    highestReportedRef.current = percent;
    debouncedReport(percent);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl overflow-hidden bg-black aspect-video">
        <ReactPlayer url={lesson.content_url} controls width="100%" height="100%" onProgress={handleProgress} />
      </div>
      <p className="text-xs text-gray-500">
        Watch at least {lesson.video_watch_threshold_percent}% to mark this lesson complete.
        {isSubmitting ? ' Saving progress…' : ''}
      </p>
    </div>
  );
};

export default VideoLesson;
