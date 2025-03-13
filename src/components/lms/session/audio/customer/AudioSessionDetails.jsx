'use client';
import Avatar from '@mui/material/Avatar';
import { toast } from 'react-toastify';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import AudioPlayer from '@/components/common/player/AudioPlayer';
import { updateProgramContentProgress } from '@/services/private/customer/program';
import { SESSION_TYPE } from '@/utils/enums';

const AudioSessionDetails = ({ data: sessionDetails }) => {
  const searchParams = useSearchParamUtils();
  const programID = searchParams.get('program');
  const moduleID = searchParams.get('module');

  const handleUpdateSessionProgress = async currentTime => {
    try {
      await updateProgramContentProgress({
        id: programID,
        module: moduleID,
        content_type: SESSION_TYPE.audio,
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
        {/* Left Section - Image */}
        <div className="w-full flex justify-center">
          <AudioPlayer
            url={sessionDetails.content_link}
            title={sessionDetails.title}
            thumbnail={sessionDetails.image}
            onUpdateProgress={handleUpdateSessionProgress}
            onReady={player => {
              player.seekTo(parseInt(sessionDetails.watch_duration || '0'));
            }}
          />
        </div>

        {/* Right Section - Details */}
        <div className="w-full flex flex-col gap-5">
          <h3 className="text-2xl font-bold dark:text-white">{sessionDetails.title}</h3>

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

export default AudioSessionDetails;
