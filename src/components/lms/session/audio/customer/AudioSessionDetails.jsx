'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Avatar from '@mui/material/Avatar';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/loader/PageLoader';
import AudioPlayer from '@/components/common/player/AudioPlayer';
import { getSingleSession } from '@/services/private/customer/session';
import queryKeys from '@/utils/query-keys';

const AudioSessionDetails = () => {
  const params = useParams();
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleSession({ id: params.id }),
    queryKey: [queryKeys.customerAudioSessions, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  const sessionDetails = response?.data?.data || {};

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button>Mark As Done</Button>
      </div>

      {/* Details Card */}
      <div className="flex flex-col gap-7 p-8 bg-white rounded-lg shadow-md dark:bg-boxdark">
        {/* Left Section - Image */}
        <div className="w-full flex justify-center">
          <AudioPlayer audio={sessionDetails.content_link} thumbnail={sessionDetails.image} />
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
