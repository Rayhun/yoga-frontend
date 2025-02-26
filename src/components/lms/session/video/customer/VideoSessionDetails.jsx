'use client';
import Avatar from '@mui/material/Avatar';
import { toast } from 'react-toastify';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import VideoPlayer from '@/components/common/player/VideoPlayer';
import { updateProgramContentProgress } from '@/services/private/customer/program';
import { SESSION_TYPE } from '@/utils/enums';

const VideoSessionDetails = ({ data: sessionDetails }) => {
  const searchParams = useSearchParamUtils();
  const programID = searchParams.get('program');
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
      await updateProgramContentProgress({
        id: programID,
        module: moduleID,
        content_type: SESSION_TYPE.video,
        content_id: sessionDetails.id,
        duration: currentTime.toString(),
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
            url="https://vimeo.com/115783408"
            onReady={player => {
              player.seekTo(120);
            }}
            onUpdateProgress={handleUpdateSessionProgress}
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

          <div className="flex items-center gap-2">
            <Avatar src={sessionDetails?.expert?.image} />
            <div className="flex flex-col text-center">
              <p className="font-bold">{sessionDetails?.expert?.name}</p>
              <p className="text-xs">{sessionDetails?.expert?.title}</p>
            </div>
          </div>

          <p className="dark:text-white">{sessionDetails?.description}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoSessionDetails;
