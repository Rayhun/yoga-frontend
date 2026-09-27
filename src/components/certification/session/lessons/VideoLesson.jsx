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

const toWatchPercent = (seconds, durationSeconds) =>
  durationSeconds ? Math.min(100, Math.round((seconds / durationSeconds) * 100)) : 0;

/**
 * Progress is saved every ~15s (VideoPlayer's cadence), on pause, on SPA navigation away
 * (unmount) and on tab close/reload (keepalive fetch). Playback resumes from resume_seconds once.
 * Completion is requested when the reported % reaches the lesson's threshold — the server
 * re-checks its stored watch_percent and decides.
 */
const VideoLesson = ({ lesson, programId }) => {
  const queryClient = useQueryClient();
  const playerRef = useRef(null);
  const durationSecondsRef = useRef(0);
  const hasResumedRef = useRef(false);
  const isCompletingRef = useRef(Boolean(lesson.is_completed));
  const [watchPercent, setWatchPercent] = useState(lesson.watch_percent || 0);

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

  const handleReady = player => {
    playerRef.current = player;
    durationSecondsRef.current = player.getDuration() || durationSecondsRef.current;
    // onReady can fire more than once — resume only the first time, or playback jumps back.
    if (!hasResumedRef.current) {
      hasResumedRef.current = true;
      if (lesson.resume_seconds) player.seekTo(lesson.resume_seconds, 'seconds');
    }
  };

  if (!lesson.content_url) {
    return <p className="p-8 text-center text-gray-500">This video isn&apos;t available yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <VideoPlayer
        url={lesson.content_url}
        fallbackOnError={false}
        onReady={handleReady}
        onDuration={durationSeconds => {
          durationSecondsRef.current = durationSeconds;
        }}
        onUpdateProgress={currentTime =>
          saveProgress({
            positionSeconds: Math.floor(currentTime),
            watchPercent: toWatchPercent(currentTime, durationSecondsRef.current),
          })
        }
        onPause={() => saveProgress(currentProgress())}
      />
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
