import React, { useMemo } from 'react';
import Image from 'next/image';
import { Chip } from '@mui/material';
import Link from 'next/link';
import PageLoader from '../loader/PageLoader';
import ControllableText from '@/components/common/details/ControllableText';
import dayjs from 'dayjs';
import { RiEdit2Line } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { IoVideocamOutline } from 'react-icons/io5';
import { LuClock } from 'react-icons/lu';
import Button from '../Button';

const DetailSection = ({ label, children }) => (
  <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-sm">
    <h5 className="font-bold">{label}</h5>
    <div>{children}</div>
  </div>
);

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
    <div className="flex flex-col gap-7">
      {/* Event Details Card */}
      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 relative">
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
        <div className="w-full md:w-1/2 flex flex-col gap-5 p-8 bg-white rounded-lg shadow-md dark:bg-boxdark">
          <h3 className="text-2xl font-bold dark:text-white">
            {eventDetails?.title || 'Group Coaching Program'}
          </h3>

          {/* Event Info */}
          <div className="flex flex-col gap-4 text-gray-600 dark:text-white">
            <div className="flex items-start gap-3">
              <LuClock size={24} className="text-gray-400" />
              <div className="text-dark">
                <div className="font-bold">{startDate.format('dddd, MMMM D, YYYY')}</div>
                <div className="font-bold">{`${startDate.format('h:mm A')} to ${endDate.format('h:mm A')} ${
                  eventDetails?.time_zone || ''
                }`}</div>
              </div>
              {/* <span>{eventDetails?.duration || '30'} min</span> */}
            </div>
            <div className="flex items-start gap-3">
              <IoVideocamOutline size={24} className="text-gray-400" />
              <div>
                <p className="capitalize font-bold">{eventDetails?.event_type || 'Offline'}</p>
                <p className="text-sm">Link visible to attendees</p>
              </div>
            </div>
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
            <div className={`${isCustomerView ? 'pl-1' : 'pl-6'}`}>
              <span className="font-bold text-xl">{`${eventDetails?.currency_symbol || '$'} ${
                eventDetails?.price
              }`}</span>
            </div>
          </div>

          {isCustomerView &&
            !eventDetails?.is_enroll &&
            (eventDetails?.is_paid ? (
              <Link href={`/payment/group_coaching/${eventId}`}>
                <div className="w-full md:w-auto bg-primary text-white disabled:bg-gray-300 px-6 py-3 text-center rounded-lg shadow hover:bg-primary/80">
                  {'Buy Now'}
                </div>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="2xl"
                onClick={handleEnrollGroupCoaching}
                disabled={enrolling}
                // className="w-full md:w-auto bg-primary text-white disabled:bg-gray-300 p-2 text-center rounded-xl shadow hover:bg-primary/80"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            ))}
          {isCustomerView && eventDetails?.is_enroll && (
            <p className="break-words text-right line-clamp-1 text-sm font-semibold text-primary">
              {`Joined`}
            </p>
          )}
          {!isCustomerView && eventDetails?.status === 'Scheduled' && (
            <>
              <Button
                variant='primary'
                size="2xl"
                disabled={isBeforeStartDate || completingEvent}
                onClick={toggleCompletionModal}
                // className="flex-1  w-full md:w-auto bg-primary text-white disabled:bg-gray-300 p-2 text-center rounded-xl shadow hover:bg-primary/80"
              >
                {completingEvent ? 'Completing...' : 'Mark as Completed'}
              </Button>
              <Button
                variant="secondary"
                size="2xl"
                disabled={isAfterStartDate || canceling}
                onClick={handleCancelEvent}
                
                // className="flex-1  w-full md:w-auto bg-gray-200 disabled:bg-gray-300 p-2 text-center rounded-xl shadow hover:bg-gray-300"
              >
                {canceling ? 'Cancelling...' : 'Cancel Coaching'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Event Content */}
      <div className="flex flex-col gap-7">
        <DetailSection label={'Event Description'}>
          <ControllableText>{eventDetails?.description || 'Not Available'}</ControllableText>
        </DetailSection>
        <DetailSection label={'Meeting Link'}>
          <a className="text-gray-500" href={eventDetails?.meeting_link} target="_blank">
            {eventDetails?.meeting_link}
          </a>
        </DetailSection>
        {eventDetails?.recording_link && (
          <DetailSection label={'Recording Link'}>
            <a className="text-gray-500" href={eventDetails?.recording_link} target="_blank">
              {eventDetails?.recording_link}
            </a>
          </DetailSection>
        )}
        <DetailSection label={'Status'}>
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
        </DetailSection>

        <DetailSection label={'Categories'}>
          <div className="flex flex-wrap gap-2">
            {eventDetails?.categories?.map(tag => (
              <ProfileChip key={tag.id} label={tag?.name} />
            ))}
          </div>
        </DetailSection>
        <DetailSection label={'Tags'}>
          <div className="flex flex-wrap gap-2">
            {eventDetails?.tags?.map(tag => (
              <ProfileChip key={tag.id} label={tag?.name} />
            ))}
          </div>
        </DetailSection>
      </div>
    </div>
  );
};
