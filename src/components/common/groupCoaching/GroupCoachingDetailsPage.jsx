import React, { useMemo } from 'react';
import Image from 'next/image';
import { Chip } from '@mui/material';
import Link from 'next/link';
import PageLoader from '../loader/PageLoader';
import ControllableText from '@/components/common/details/ControllableText';
import dayjs from 'dayjs';
import { RiEdit2Line } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { IoVideocamOutline } from "react-icons/io5";
import { LuClock } from "react-icons/lu";



const ProfileChip = ({ label }) => <Chip label={label} className="bg-dark/10 text-dark" />;

export const GroupCoachingDetails = ({
  eventDetails,
  isLoading,
  isCustomerView = false,
  eventId,
  handleCancelEvent,
  canceling,
  completingEvent,
  toggleCompletionModal,
  handleEnrollGroupCoaching,
  enrolling,
}) => {
  const router = useRouter();

  const { isBeforeStartDate, isAfterStartDate } = useMemo(() => {
    if (!eventDetails?.start_date) {
      return { isBeforeStartDate: false, isAfterStartDate: false };
    }

    const now = dayjs();
    const dateToCheck = dayjs(eventDetails.start_date);

    const comparison = now.valueOf() - dateToCheck.valueOf();

    return {
      isBeforeStartDate: comparison < 0,
      isAfterStartDate: comparison > 0,
    };
  }, [eventDetails?.start_date]);

  if (isLoading) return <PageLoader />;


  const startDate = dayjs(eventDetails?.start_date);
  const endDate = startDate.add(eventDetails?.duration, 'minute');

  const onEdit = () => {
    router.push(`/portal/teacher/group_coaching/${eventId}/edit`);
  };

  return (
    <div>
      {/* Event Details Card */}
      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 relative p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
        {!isCustomerView && (
          <button
            className="absolute right-6 top-3 inline-flex items-center justify-center text-primary  text-sm text-center font-medium hover:underline"
            onClick={onEdit}
          >
            <RiEdit2Line />
            Edit
          </button>
        )}
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
          <div className="flex flex-col gap-4 text-gray-600 dark:text-white">
            <div className="flex items-start gap-3">
              <LuClock size={24} className="text-gray-400" />
              <div className='text-dark'>
                <div className='font-bold'>{startDate.format('dddd, MMMM D, YYYY')}</div>
                <div className='font-bold'>{`${startDate.format('h:mm A')} to ${endDate.format('h:mm A')} ${
                  eventDetails?.time_zone || ''
                }`}</div>
              </div>
              {/* <span>{eventDetails?.duration || '30'} min</span> */}
            </div>
            <div className="flex items-start gap-3">
              <IoVideocamOutline size={24} className="text-gray-400" />
              <div>
                <p className='capitalize font-bold'>{eventDetails?.event_type || 'Offline'}</p>
                <p className='text-sm'>Link visible to attendees</p>
              </div>
            </div>
            <div className="pl-6">
                <span className='font-bold text-xl'>{`${eventDetails?.currency_symbol || '$'} ${eventDetails?.price}`}</span>
            </div>
          </div>

          {/* Instructor Info */}
          {isCustomerView && (
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
          )}
          {isCustomerView &&
            !eventDetails?.is_enroll &&
            (eventDetails?.is_paid ? (
              <Link href={`/payment/group_coaching/${eventId}`}>
                <div className="w-full md:w-auto bg-primary text-white disabled:bg-gray-300 p-2 text-center rounded-xl shadow hover:bg-primary/80">
                  {'Buy Now'}
                </div>
              </Link>
            ) : (
              <button
                onClick={handleEnrollGroupCoaching}
                disabled={enrolling}
                className="w-full md:w-auto bg-primary text-white disabled:bg-gray-300 p-2 text-center rounded-xl shadow hover:bg-primary/80"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            ))}
          {isCustomerView && eventDetails?.is_enroll && (
            <p className="break-words text-right line-clamp-1 text-sm font-semibold text-primary">
              {`Joined`}
            </p>
          )}
          {!isCustomerView && eventDetails?.status === 'Scheduled' && (
            <div className="flex gap-4 items-center">
              <button
                disabled={isAfterStartDate || canceling}
                onClick={handleCancelEvent}
                className="flex-1 md:w-auto bg-gray-200 disabled:bg-gray-300 p-2 text-center rounded-xl shadow hover:bg-gray-300"
              >
                {canceling ? 'Cancelling...' : 'Cancel Coaching'}
              </button>
              <button
                disabled={isBeforeStartDate || completingEvent}
                onClick={toggleCompletionModal}
                className="flex-1 md:w-auto bg-primary text-white disabled:bg-gray-300 p-2 text-center rounded-xl shadow hover:bg-primary/80"
              >
                {completingEvent ? 'Completing...' : 'Mark as Completed'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Event Content */}
      <div className="p-4 my-5 bg-white rounded-lg shadow-md text-gray-800 dark:text-gray-200 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="font-bold">Description</p>
          <ControllableText>{eventDetails?.description || 'Not Available'}</ControllableText>
        </div>
        <div className="flex gap-10">
          <div className="flex gap-2">
            <p className="font-bold">Meeting Link:</p>
            <a className="text-gray-500">{eventDetails?.meeting_link}</a>
          </div>
        </div>
        {eventDetails?.recording_link && (
          <div className="flex gap-10">
            <div className="flex gap-2">
              <p className="font-bold">Recording Link:</p>
              <a className="text-gray-500">{eventDetails?.recording_link}</a>
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-4 flex-col gap-5">
          {/* Event Info */}
          <div className="flex flex-col gap-2">
            <p className="font-bold">Status</p>
            <span
              className={`capitalize font-semibold ${
                eventDetails?.status === 'completed'
                  ? 'text-green-600'
                  : eventDetails?.status === 'cancelled'
                  ? 'text-red-500'
                  : 'text-yellow-500'
              }`}
            >
              {eventDetails?.status || 'Not available'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bold">Categories</p>
          <div className="flex flex-wrap gap-2">
            {eventDetails?.categories?.map(tag => (
              <ProfileChip key={tag.id} label={tag?.name} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-bold">Tags</p>
          <div className="flex flex-wrap gap-2">
            {eventDetails?.tags?.map(tag => (
              <ProfileChip key={tag.id} label={tag?.name} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
