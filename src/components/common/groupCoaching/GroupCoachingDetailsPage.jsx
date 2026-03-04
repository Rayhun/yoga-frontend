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
import { LuClock, LuLink2, LuUser } from 'react-icons/lu';
import { HiOutlineStatusOnline, HiOutlineTag } from 'react-icons/hi';
import { MdOutlineDescription, MdOutlineCategory } from 'react-icons/md';
import { FaCheckCircle } from 'react-icons/fa';
import Button from '../Button';
const DetailSection = ({ label, children, icon: Icon }) => (
  <div className="flex flex-col gap-4 bg-white dark:bg-boxdark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-strokedark hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="text-primary dark:text-primary" size={20} />}
      <h5 className="font-bold text-lg text-gray-900 dark:text-white">{label}</h5>
    </div>
    <div className="text-gray-700 dark:text-bodydark">{children}</div>
  </div>
);

const ProfileChip = ({ label }) => (
  <Chip 
    label={label} 
    className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary capitalize font-medium border border-primary/20 dark:border-primary/30 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors" 
  />
);

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
    const dateToCheck = eventDetails?.start_date_utc ?? eventDetails?.start_date;
    if (!dateToCheck) {
      return { isBeforeStartDate: false, isAfterStartDate: false };
    }
    const now = dayjs();
    const comparison = now.valueOf() - dayjs(dateToCheck).valueOf();
    return {
      isBeforeStartDate: comparison < 0,
      isAfterStartDate: comparison > 0,
    };
  }, [eventDetails?.start_date_utc, eventDetails?.start_date]);

  if (isLoading) return <PageLoader />;

  // Use user_datetime (user-local start) so end time matches the displayed start time; fallback to start_date
  // 1. Use parseZone to lock the time to +02:00
  const startDate = dayjs.parseZone(eventDetails?.start_date);
  const endDate = dayjs.parseZone(eventDetails?.end_date);

  const onEdit = () => {
    router.push(`/portal/teacher/group_coaching/${eventId}/edit`);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Event Details Card */}
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Section - Image */}
        <div className="w-full relative group">
          <div className="relative overflow-hidden rounded-2xl shadow-xl border border-gray-200 dark:border-strokedark h-full min-h-[400px] lg:min-h-[500px]">
            <Image
              src={eventDetails?.image || '/images/content/default.png'}
              alt="Event Image"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>

        {/* Right Section - Event Details */}
        <div className="w-full flex flex-col gap-4 p-5 lg:p-6 bg-white dark:bg-boxdark rounded-2xl shadow-lg border border-gray-100 dark:border-strokedark relative h-full min-h-[400px] lg:min-h-[500px]">
          {/* Edit Button */}
          {!isCustomerView && (
            <button
              className="absolute right-4 top-4 inline-flex items-center gap-1.5 text-primary dark:text-primary hover:text-primary/80 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-200 z-10"
              onClick={onEdit}
            >
              <RiEdit2Line size={16} />
              Edit
            </button>
          )}

          {/* Enrolled Badge */}
          {isCustomerView && eventDetails?.is_enroll && (
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-green-600 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 z-10">
              <FaCheckCircle size={12} />
              Joined
            </div>
          )}

          {/* Title */}
          <div className="pr-20">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              {eventDetails?.title || 'Group Coaching Program'}
            </h1>
          </div>

          {/* Event Info - Compact */}
          <div className="flex flex-col gap-3 flex-1">
            {/* Date & Time */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-boxdark-2 rounded-lg border border-gray-100 dark:border-strokedark">
              <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
                <LuClock size={18} className="text-primary dark:text-primary" />
              </div>
              <div className="flex-1 text-gray-700 dark:text-bodydark min-w-0">
                {eventDetails?.start_date ? (
                  <>
                    <div className="font-bold text-base text-gray-900 dark:text-white mb-0.5">
                      {eventDetails?.user_date ?? startDate.format('dddd, MMMM D, YYYY')}
                    </div>
                    <div className="font-semibold text-sm text-gray-600 dark:text-bodydark">
                      {`${eventDetails?.user_time ?? startDate.format('h:mm A')} - ${endDate.format('h:mm A')}`}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-bold text-base text-gray-900 dark:text-white mb-0.5">—</div>
                    <div className="font-semibold text-sm text-gray-600 dark:text-bodydark">—</div>
                  </>
                )}
              </div>
            </div>

            {/* Event Type */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-boxdark-2 rounded-lg border border-gray-100 dark:border-strokedark">
              <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
                <IoVideocamOutline size={18} className="text-primary dark:text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="capitalize font-bold text-base text-gray-900 dark:text-white">
                  {eventDetails?.event_type || 'Offline'}
                </p>
                <p className="text-xs text-gray-600 dark:text-bodydark mt-0.5">Link visible to attendees</p>
              </div>
            </div>

            {/* Instructor/Guest */}
            {isCustomerView && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-boxdark-2 rounded-lg border border-gray-100 dark:border-strokedark">
                <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
                  <LuUser size={18} className="text-primary dark:text-primary" />
                </div>
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {eventDetails?.guest_name ? (
                    <>
                      <div className="relative h-10 w-10 flex-shrink-0">
                        <Image
                          src="/images/user/user-06.png"
                          alt="Guest"
                          fill
                          className="rounded-full object-cover border-2 border-primary/20"
                          sizes="40px"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs text-gray-600 dark:text-bodydark font-medium">Guest</span>
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{eventDetails.guest_name}</p>
                      </div>
                    </>
                  ) : eventDetails?.instructors && eventDetails.instructors.length > 0 ? (
                    <>
                      <div className="relative h-10 w-10 flex-shrink-0">
                        <Image
                          src={eventDetails?.instructors?.[0]?.image || '/images/user/user-06.png'}
                          alt="Instructor"
                          fill
                          className="rounded-full object-cover border-2 border-primary/20"
                          sizes="40px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-gray-600 dark:text-bodydark font-medium">Instructor{eventDetails.instructors.length > 1 ? 's' : ''}</span>
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {eventDetails.instructors.map((instructor, index) => (
                            <span key={index}>
                              {instructor.name}
                              {index < eventDetails.instructors.length - 1 && ', '}
                            </span>
                          ))}
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="p-3 bg-gradient-to-r from-primary/10 to-green-50 dark:from-primary/20 dark:to-green-900/20 rounded-lg border border-primary/20 dark:border-primary/30 mt-auto">
              <div className="flex items-baseline gap-2">
                {Number(eventDetails?.price) !== 0 && (
                  <span className="text-xs text-gray-600 dark:text-bodydark font-medium">Price</span>
                )}
                <span className="font-bold text-2xl text-primary dark:text-primary">
                  {Number(eventDetails?.price) === 0 ? 'Free' : `${eventDetails?.currency_symbol || '$'}${eventDetails?.price ?? '0'}`}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-2">
            {isCustomerView && !eventDetails?.is_enroll && (
              eventDetails?.price > 0 || eventDetails?.is_paid ? (
                <Link href={`/payment/group_coaching/${eventId}`} className="w-full">
                  <div className="w-full bg-gradient-to-r from-primary to-green-600 text-white px-5 py-3 text-center rounded-xl shadow-lg hover:shadow-xl hover:from-primary/90 hover:to-green-600/90 transition-all duration-200 font-semibold text-base">
                    Buy Now
                  </div>
                </Link>
              ) : (
                <Button
                  variant="primary"
                  size="xl"
                  onClick={handleEnrollGroupCoaching}
                  disabled={enrolling}
                  fullWidth
                  className="shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </Button>
              )
            )}
            {!isCustomerView && eventDetails?.status === 'Scheduled' && (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Button
                  variant="primary"
                  size="xl"
                  disabled={isBeforeStartDate || completingEvent}
                  onClick={toggleCompletionModal}
                  fullWidth
                  className="shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {completingEvent ? 'Completing...' : 'Mark as Completed'}
                </Button>
                <Button
                  variant="secondary"
                  size="xl"
                  disabled={isAfterStartDate || canceling}
                  onClick={handleCancelEvent}
                  fullWidth
                  className="shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {canceling ? 'Cancelling...' : 'Cancel Coaching'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="flex flex-col gap-6">
        <DetailSection label="Event Description" icon={MdOutlineDescription}>
          <ControllableText>{eventDetails?.description || 'Not Available'}</ControllableText>
        </DetailSection>

        {eventDetails?.meeting_link && (
          <DetailSection label="Meeting Link" icon={LuLink2}>
            <a 
              className="text-primary dark:text-primary hover:text-primary/80 hover:underline font-medium break-all flex items-center gap-2" 
              href={eventDetails?.meeting_link} 
              target="_blank"
              rel="noopener noreferrer"
            >
              <LuLink2 size={16} />
              {eventDetails?.meeting_link}
            </a>
          </DetailSection>
        )}

        {eventDetails?.recording_link && (
          <DetailSection label="Recording Link" icon={LuLink2}>
            <a 
              className="text-primary dark:text-primary hover:text-primary/80 hover:underline font-medium break-all flex items-center gap-2" 
              href={eventDetails?.recording_link} 
              target="_blank"
              rel="noopener noreferrer"
            >
              <LuLink2 size={16} />
              {eventDetails?.recording_link}
            </a>
          </DetailSection>
        )}

        <DetailSection label="Status" icon={HiOutlineStatusOnline}>
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${
              eventDetails?.status === 'completed'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : eventDetails?.status === 'cancelled'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}
          >
            {eventDetails?.status === 'completed' && <FaCheckCircle size={14} />}
            {eventDetails?.status || 'Not available'}
          </span>
        </DetailSection>

        {eventDetails?.followup_support && (
          <DetailSection label="Followup Type" icon={HiOutlineTag}>
            <div className="flex flex-wrap gap-2">
              {eventDetails.followup_support.split(',').map((tag, index) => (
                <ProfileChip key={`${index}-${tag}`} label={tag.trim()} />
              ))}
            </div>
          </DetailSection>
        )}

        {eventDetails?.categories && eventDetails.categories.length > 0 && (
          <DetailSection label="Categories" icon={MdOutlineCategory}>
            <div className="flex flex-wrap gap-2">
              {eventDetails.categories.map((tag, index) =>
                isCustomerView ? (
                  <ProfileChip key={`${index}-${tag}`} label={tag} />
                ) : (
                  <ProfileChip key={tag.id} label={tag?.name} />
                )
              )}
            </div>
          </DetailSection>
        )}

        {eventDetails?.tags && eventDetails.tags.length > 0 && (
          <DetailSection label="Tags" icon={HiOutlineTag}>
            <div className="flex flex-wrap gap-2">
              {eventDetails.tags.map((tag, index) =>
                isCustomerView ? (
                  <ProfileChip key={`${index}-${tag}`} label={tag} />
                ) : (
                  <ProfileChip key={tag.id} label={tag?.name} />
                )
              )}
            </div>
          </DetailSection>
        )}
      </div>
    </div>
  );
};
