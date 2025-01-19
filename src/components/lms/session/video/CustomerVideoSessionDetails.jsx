'use client';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import Avatar from '@mui/material/Avatar';
import { FaTv } from 'react-icons/fa';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import { getSingleSession } from '@/services/private/customer/session';
import queryKeys from '@/utils/query-keys';

const CustomerVideoSessionDetails = () => {
  const params = useParams();
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleSession({ id: params.id }),
    queryKey: [queryKeys.customerVideoSessions, params.id],
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
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
        {/* Left Section - Image */}
        <div className="w-full md:w-1/2">
          <Image
            src={sessionDetails?.image || '/images/module/module-01.jpg'}
            alt="Module Image"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full max-h-[400px] rounded-lg shadow-lg"
          />
        </div>

        {/* Right Section - Details */}
        <div className="w-full md:w-1/2 flex flex-col gap-5">
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

          <p className="line-clamp-4 dark:text-white">{sessionDetails?.description}</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerVideoSessionDetails;
