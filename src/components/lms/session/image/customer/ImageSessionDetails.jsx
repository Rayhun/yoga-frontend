'use client';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import { getSingleSession } from '@/services/private/customer/session';
import queryKeys from '@/utils/query-keys';

const ImageSessionDetails = () => {
  const params = useParams();
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleSession({ id: params.id }),
    queryKey: [queryKeys.customerImageSessions, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  const sessionDetails = response?.data?.data || {};

  const SESSION_CARDS = [
    {
      label: 'Total Run Time',
      value: `${sessionDetails.duration} sec`,
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
      value: sessionDetails.intensity.equipments?.[0],
    },
    {
      label: 'Focus Area',
      value: sessionDetails.focus_areas?.[0],
    },
  ];

  return (
    <div>
      {/* Details Card */}
      <div className="flex flex-col gap-7 p-8 bg-white rounded-lg shadow-md dark:bg-boxdark">
        {/* Left Section - Image */}
        <div className="w-full">
          <Image
            src={sessionDetails?.content_link}
            alt="Image"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full max-h-[800px] rounded-lg shadow-lg"
          />
        </div>

        {/* Right Section - Details */}
        <div className="w-full flex flex-col gap-5">
          <h3 className="text-2xl font-bold dark:text-white">{sessionDetails.title}</h3>
          <p className="line-clamp-6 dark:text-white">{sessionDetails?.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageSessionDetails;
