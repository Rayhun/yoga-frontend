import React from 'react';
import Image from 'next/image';
import { Chip } from '@mui/material';
import { FaTv } from 'react-icons/fa';
import { PiClockCountdown } from 'react-icons/pi';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getExpertGroupCoachingDetails } from '@/services/private/expert/groupCoaching';
import queryKeys from '@/utils/query-keys';
import PageLoader from '../loader/PageLoader';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';

const ProfileChip = ({ label }) => <Chip label={label} className="bg-dark/10 text-dark" />;

export const GroupCoachingDetails = ({ isCustomerView = false }) => {
  const params = useParams();
  const eventId = params.id;

  const {
    data: response,
    isLoading,
    failureReason,
    refetch,
  } = useQuery({
    queryFn: () => getExpertGroupCoachingDetails({ id: eventId }),
    queryKey: [queryKeys.expertGroupCoachingDetails, eventId],
  });

  const eventDetails = response?.data?.data || {};

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      {/* Event Details Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
        {/* Left Section - Image */}
        <div className="w-full md:w-1/2">
          <Image
            src={eventDetails?.image || '/images/content/default.png'}
            alt="Event Image"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full max-h-[400px] rounded-lg shadow-lg"
          />
        </div>

        {/* Right Section - Event Details */}
        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <h3 className="text-2xl font-bold dark:text-white">
            {eventDetails?.title || 'Group Coaching Program'}
          </h3>

          {/* Event Info */}
          <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-white">
            <div className="flex items-center gap-3">
              <FaTv size={24} className="text-primary" />
              <span>{eventDetails?.is_online ? 'Online' : 'Online'}</span>
            </div>
            <div className="flex items-center gap-3">
              <PiClockCountdown size={24} className="text-primary" />
              <span>{eventDetails?.duration || '30'} min</span>
            </div>
          </div>

          {/* Instructor Info */}
          <div className="flex items-center gap-3">
            <span className="h-12 w-12 rounded-full text-dark">
              <Image
                width={40}
                height={40}
                src={eventDetails?.instructors?.[0]?.image || '/images/user/user-06.png'}
                style={{
                  width: 'auto',
                  height: 'auto',
                }}
                alt="Instructor"
              />
            </span>
            <span className="font-bold">Instructors:</span>
            {eventDetails?.instructors?.map((instructor, index) => (
              <span key={index} className="text-gray-600 dark:text-white">
                {instructor.name}
                {index < eventDetails?.instructors?.length - 1 && ', '}
              </span>
            ))}
          </div>
          {isCustomerView && (
            <>
              {eventDetails?.is_paid ? (
                <Link href={`/payment/group_coaching/${eventId}`}>
                  <div className="w-full md:w-auto bg-primary text-white disabled:bg-gray-300 p-4 text-center rounded-md shadow hover:bg-primary/80">
                    {'Buy Now'}
                  </div>
                </Link>
              ) : (
                <button className="w-full md:w-auto bg-primary text-white disabled:bg-gray-300 p-4 rounded-md shadow hover:bg-primary/80">
                  {'Join now'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Event Content */}
      <div className="p-4 my-5 bg-white rounded-lg shadow-md text-gray-800 dark:text-gray-200 flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-4 flex-col gap-5">
          {/* Event Info */}
          <div className="flex flex-col gap-2">
            <h5 className="text-lg text-primary font-bold">Event Type</h5>
            <span>{eventDetails?.event_type || 'Not available'}</span>
          </div>
          <div className="flex flex-col gap-2">
            <h5 className="text-lg text-primary font-bold">Capacity</h5>
            <span>{eventDetails?.capacity || 'Not available'}</span>
          </div>

          <div className="flex flex-col gap-2">
            <h5 className="text-lg text-primary font-bold">Zoom Integration</h5>
            <span>{eventDetails?.is_online ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="flex flex-col gap-2">
            <h5 className="text-lg text-primary font-bold">Meeting ID</h5>
            <span>{eventDetails?.meeting_link || 'Not available'}</span>
          </div>

          <div className="flex flex-col gap-2">
            <h5 className="text-lg text-primary font-bold">Status</h5>
            <span>{eventDetails?.status || 'Not available'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h5 className="text-lg text-primary font-bold">Tags</h5>
          <div className="flex flex-wrap gap-2">
            {eventDetails?.tags?.map(tag => (
              <ProfileChip key={tag.id} label={tag?.name} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h5 className="text-lg text-primary font-bold">Categories</h5>
          <div className="flex flex-wrap gap-2">
            {eventDetails?.categories?.map(tag => (
              <ProfileChip key={tag.id} label={tag?.name} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h5 className="text-lg text-primary font-bold">Description</h5>
          <p>{eventDetails?.description || 'Not Available'}</p>
        </div>
      </div>
    </div>
  );
};
