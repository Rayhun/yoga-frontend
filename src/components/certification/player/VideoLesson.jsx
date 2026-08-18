'use client';
import { useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { debounce } from 'lodash';
import { BiCheckCircle } from 'react-icons/bi';

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

  const handleProgress = useCallback(
    ({ played }) => {
      if (isCompleted) return;
      const percent = Math.round(played * 100);
      if (percent <= highestReportedRef.current) return;
      highestReportedRef.current = percent;
      debouncedReport(percent);
    },
    [isCompleted, debouncedReport]
  );

  const handleMarkComplete = useCallback(() => {
    // Bypasses the debounce and the watch-percent check entirely — this is a deliberate one-off
    // user action, not a progress tick, so it should apply immediately. The endpoint itself has
    // no separate "force complete" flag; sending 100 is what satisfies its own threshold check.
    debouncedReport.cancel();
    onComplete({ watch_percent: 100 });
  }, [debouncedReport, onComplete]);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl overflow-hidden bg-black aspect-video">
        <ReactPlayer url={lesson.content_url} controls width="100%" height="100%" onProgress={handleProgress} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500">
          Watch at least {lesson.video_watch_threshold_percent}% to mark this lesson complete.
          {isSubmitting ? ' Saving progress…' : ''}
        </p>
        {isCompleted ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 flex-shrink-0">
            <BiCheckCircle className="text-base" /> Completed
          </span>
        ) : (
          <button
            onClick={handleMarkComplete}
            disabled={isSubmitting}
            className="flex-shrink-0 py-1.5 px-3.5 rounded-lg font-semibold text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Mark as complete'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoLesson;
