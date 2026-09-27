'use client';
import { useRef } from 'react';
import { toast } from 'react-toastify';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import VideoPlayer from '@/components/common/player/VideoPlayer';
import {
  completeCertificationLesson,
  updateCertificationLessonProgress,
} from '@/services/private/certification/catalog';
import ControllableRichText from '@/components/common/details/ControllableRichText';

const VideoSessionDetails = ({ data: sessionDetails, programId, onCompleted = () => null }) => {
  const searchParams = useSearchParamUtils();
  const programID = programId || searchParams.get('program');
  const durationSecondsRef = useRef(0);
  const hasResumedRef = useRef(false);
  const isCompletedRef = useRef(Boolean(sessionDetails.is_completed));

  const SESSION_CARDS = [
    {
      label: 'Total Run Time',
      value: sessionDetails.duration,
    },
    {
      label: 'Category',
      value: sessionDetails.categories?.[0],
    },
    {
      label: 'Difficulty',
      value: sessionDetails.difficulty,
    },
    {
      label: 'Intensity',
      value: sessionDetails.intensity,
    },
    {
      label: 'Equipment',
      value: sessionDetails.equipments?.[0],
    },
    {
      label: 'Focus Area',
      value: sessionDetails.focus_areas?.[0],
    },
  ];

  // Every ~15s (VideoPlayer's cadence): save watch % + position via the progress endpoint, and
  // complete the lesson once the server-side threshold is reached. The backend re-checks the
  // stored watch_percent, so this is a convenience trigger, not the source of truth.
  const handleUpdateSessionProgress = async currentTime => {
    const durationSeconds = durationSecondsRef.current;
    if (!durationSeconds) return;
    const watchPercent = Math.min(100, Math.round((currentTime / durationSeconds) * 100));
    try {
      await updateCertificationLessonProgress({
        programId: programID,
        lessonId: sessionDetails.id,
        watchPercent,
        positionSeconds: Math.floor(currentTime),
      });
      if (!isCompletedRef.current && watchPercent >= sessionDetails.video_watch_threshold_percent) {
        isCompletedRef.current = true;
        await completeCertificationLesson({ programId: programID, lessonId: sessionDetails.id });
        onCompleted();
      }
    } catch (error) {
      toast.error('Something went wrong in updating session progress');
    }
  };

  const handlePlayerReady = player => {
    durationSecondsRef.current = player.getDuration() || durationSecondsRef.current;
    // onReady can fire more than once — only resume on the first, or playback jumps back.
    if (!hasResumedRef.current) {
      hasResumedRef.current = true;
      if (sessionDetails.resume_seconds) player.seekTo(sessionDetails.resume_seconds, 'seconds');
    }
  };

  return (
    <div>
      {/* Details Card */}
      <div className="flex flex-col gap-7 p-8 bg-white rounded-lg shadow-md dark:bg-boxdark">
        {/* Left Section - Video */}
        <div className="w-full">
          <VideoPlayer
            url={sessionDetails.content_url}
            onUpdateProgress={handleUpdateSessionProgress}
            onReady={handlePlayerReady}
            onDuration={durationSeconds => {
              durationSecondsRef.current = durationSeconds;
            }}
          />
        </div>

        {/* Right Section - Details */}
        <div className="w-full flex flex-col gap-5">
          <h3 className="text-2xl font-bold dark:text-white">{sessionDetails.title}</h3>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-600 dark:text-white">
            {SESSION_CARDS.map(item => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1 p-2 rounded-md border border-gray-200 text-xs dark:text-white dark:bg-boxdark-2"
              >
                <span className="font-bold">{item.label}</span>
                <span>{item.value || '-'}</span>
              </div>
            ))}
          </div>

          <ControllableRichText className="dark:text-white">{sessionDetails?.text_content || 'No description provided'}</ControllableRichText>
        </div>
      </div>
    </div>
  );
};

export default VideoSessionDetails;
