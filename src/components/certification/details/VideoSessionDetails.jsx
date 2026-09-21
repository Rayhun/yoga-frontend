'use client';
import Avatar from '@mui/material/Avatar';
import { toast } from 'react-toastify';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import VideoPlayer from '@/components/common/player/VideoPlayer';
import { completeCertificationLesson } from '@/services/private/certification/catalog';
import ControllableRichText from '@/components/common/details/ControllableRichText';

const VideoSessionDetails = ({ data: sessionDetails, programId }) => {
  const searchParams = useSearchParamUtils();
  const programID = programId || searchParams.get('program');
  const moduleID = searchParams.get('module');

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

  const handleUpdateSessionProgress = async currentTime => {
    try {
      await completeCertificationLesson({
        programId: programID,
        lessonId: sessionDetails.id,
        watchPercent: Math.round((currentTime / sessionDetails.duration_seconds) * 100),
      });
    } catch (error) {
      toast.error('Something went wrong in updating session progress');
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
            onReady={player => {
              player.seekTo(parseInt(sessionDetails.watch_duration || '0'));
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
