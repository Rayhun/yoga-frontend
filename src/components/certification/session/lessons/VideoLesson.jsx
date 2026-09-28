'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import VideoPlayer from '@/components/common/player/VideoPlayer';
import {
  completeCertificationLesson,
  sendCertificationLessonProgressOnUnload,
  updateCertificationLessonProgress,
} from '@/services/private/certification/catalog';
import { CompletedBadge, invalidateLearnerProgress } from '../MarkAsDoneButton';
import { normalizeVideoUrl } from '../videoUrl';

// Some failures (e.g. YouTube rejecting an embed) never reach ReactPlayer's onError — if the player
// isn't ready by then, show the inline fallback instead of an empty box.
const READY_TIMEOUT_MS = 20000;
// A saved position this close to the end (or past it) restarts from 0 instead of resuming at the end.
const RESUME_END_MARGIN_SECONDS = 5;

const toWatchPercent = (seconds, durationSeconds) =>
  durationSeconds ? Math.min(100, Math.round((seconds / durationSeconds) * 100)) : 0;

const VideoUnavailable = ({ url }) => (
  <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-strokedark dark:bg-gray-800">
    <p className="text-gray-700 dark:text-gray-200">This video couldn&apos;t be loaded here.</p>
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary/80"
    >
      Open video
    </a>
  </div>
);

/**
 * Progress is saved every ~15s (VideoPlayer's cadence), on pause, on SPA navigation away
 * (unmount) and on tab close/reload (keepalive fetch). Playback resumes once from resume_seconds,
 * clamped to the video's length. Completion is requested when the reported % reaches the lesson's
 * threshold — the server re-checks its stored watch_percent and decides. A completed lesson keeps
 * the player (rewatch) and never requests completion again.
 */
const VideoLesson = ({ lesson, programId }) => {
  const queryClient = useQueryClient();
  const playerRef = useRef(null);
  const durationSecondsRef = useRef(0);
  const hasResumedRef = useRef(false);
  const isReadyRef = useRef(false);
  const isCompletingRef = useRef(Boolean(lesson.is_completed));
  const [watchPercent, setWatchPercent] = useState(lesson.watch_percent || 0);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  const videoUrl = normalizeVideoUrl(lesson.content_url);

  const currentProgress = useCallback(() => {
    const positionSeconds = Math.floor(playerRef.current?.getCurrentTime?.() || 0);
    return { positionSeconds, watchPercent: toWatchPercent(positionSeconds, durationSecondsRef.current) };
  }, []);

  const maybeComplete = useCallback(
    async reachedPercent => {
      if (isCompletingRef.current || reachedPercent < lesson.video_watch_threshold_percent) return;
      isCompletingRef.current = true;
      try {
        await completeCertificationLesson({ programId, lessonId: lesson.id });
        await invalidateLearnerProgress(queryClient, programId);
        toast.success('Video completed');
      } catch (error) {
        isCompletingRef.current = false; // server said not yet — try again on the next save
      }
    },
    [lesson.id, lesson.video_watch_threshold_percent, programId, queryClient]
  );

  const saveProgress = useCallback(
    async ({ positionSeconds, watchPercent: reportedPercent }) => {
      if (!durationSecondsRef.current) return;
      try {
        const { data } = await updateCertificationLessonProgress({
          programId, lessonId: lesson.id, watchPercent: reportedPercent, positionSeconds,
        });
        const storedPercent = data?.data?.watch_percent ?? reportedPercent;
        setWatchPercent(storedPercent);
        await maybeComplete(storedPercent);
      } catch (error) {
        toast.error('Something went wrong in updating session progress');
      }
    },
    [lesson.id, maybeComplete, programId]
  );

  // Unmount (navigating to another lesson) and tab close/reload both save the last position.
  useEffect(() => {
    const flushOnUnload = () => {
      if (!durationSecondsRef.current) return;
      const progress = currentProgress();
      sendCertificationLessonProgressOnUnload({ programId, lessonId: lesson.id, ...progress });
    };
    window.addEventListener('pagehide', flushOnUnload);
    return () => {
      window.removeEventListener('pagehide', flushOnUnload);
      flushOnUnload();
    };
  }, [currentProgress, lesson.id, programId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isReadyRef.current) setHasLoadFailed(true);
    }, READY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  // Resume once, only when the duration is known: a saved position at/near (or past) the end —
  // e.g. left over from a longer video that was swapped out — starts from 0 instead.
  const resumeOnce = (player, durationSeconds) => {
    if (hasResumedRef.current || !durationSeconds) return;
    hasResumedRef.current = true;
    const resumeAt = lesson.resume_seconds || 0;
    if (resumeAt > 0 && resumeAt < durationSeconds - RESUME_END_MARGIN_SECONDS) player.seekTo(resumeAt, 'seconds');
  };

  const handleReady = player => {
    isReadyRef.current = true;
    playerRef.current = player;
    durationSecondsRef.current = player.getDuration() || durationSecondsRef.current;
    resumeOnce(player, durationSecondsRef.current);
  };

  if (!lesson.content_url) {
    return <p className="p-8 text-center text-gray-500">This video isn&apos;t available yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {hasLoadFailed ? (
        <VideoUnavailable url={lesson.content_url} />
      ) : (
        <VideoPlayer
          url={videoUrl}
          onLoadError={() => setHasLoadFailed(true)}
          onReady={handleReady}
          onDuration={durationSeconds => {
            durationSecondsRef.current = durationSeconds;
            if (playerRef.current) resumeOnce(playerRef.current, durationSeconds);
          }}
          onUpdateProgress={currentTime =>
            saveProgress({
              positionSeconds: Math.floor(currentTime),
              watchPercent: toWatchPercent(currentTime, durationSecondsRef.current),
            })
          }
          onPause={() => saveProgress(currentProgress())}
        />
      )}
      {lesson.is_completed ? (
        <CompletedBadge />
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Watch at least {lesson.video_watch_threshold_percent}% to complete this lesson — watched {watchPercent}% so far.
        </p>
      )}
    </div>
  );
};

export default VideoLesson;
