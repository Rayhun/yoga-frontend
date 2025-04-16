import React from 'react';
import Image from 'next/image';
import { Chip } from '@mui/material';
import { FaTv } from 'react-icons/fa';
import { PiClockCountdown } from 'react-icons/pi';
import Link from 'next/link';
import PageLoader from '../loader/PageLoader';
import { RiEdit2Line } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import ControllableText from '@/components/common/details/ControllableText';

const ProfileChip = ({ label }) => <Chip label={label} className="bg-dark/10 text-dark" />;

export const ConsultationDetails = ({
  consultationDetails,
  isLoading,
  isCustomerView = false,
  consultationId,
  handleEnrollConsultation,
  enrolling,
  handleCancelConsultation,
  canceling,
  completingConsultation,
  handleConsultationCompletion,
}) => {
  const router = useRouter();

  if (isLoading) return <PageLoader />;


  const onEdit = () => {
    router.push(`/portal/teacher/consultation/${consultationId}/edit`);
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
            src={consultationDetails?.image || '/images/content/default.png'}
            alt="Consultation Image"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full max-h-[400px] rounded-lg shadow-lg"
          />
        </div>

        {/* Right Section - Event Details */}
        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <h3 className="text-2xl font-bold dark:text-white">
            {consultationDetails?.title || 'Personal Consultation'}
          </h3>

          {/* Event Info */}
          <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-white">
            {/* <div className="flex items-center gap-3">
              <FaTv size={24} className="text-primary" />
              <span>{consultationDetails?.is_online ? 'Online' : 'Offline'}</span>
            </div> */}
            <div className="flex items-center gap-3">
              <PiClockCountdown size={24} className="text-primary" />
              <span>{consultationDetails?.duration || '30'} min</span>
            </div>
          </div>

          {/* Instructor Info */}
          {isCustomerView && (
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 rounded-full text-dark">
                <Image
                  width={40}
                  height={40}
                  src={consultationDetails?.instructors?.[0]?.image || '/images/user/user-06.png'}
                  style={{
                    width: 'auto',
                    height: 'auto',
                  }}
                  alt="Instructor"
                />
              </span>
              <span className="font-bold">Instructors:</span>
              {consultationDetails?.instructors?.map((instructor, index) => (
                <span key={index} className="text-gray-600 dark:text-white">
                  {instructor.name}
                  {index < consultationDetails?.instructors?.length - 1 && ', '}
                </span>
              ))}
            </div>
          )}
          {consultationDetails?.is_paid && consultationDetails?.price && (
            <p className="break-words line-clamp-1 text-lg font-semibold text-primary">
              {`${consultationDetails.currency_symbol || '$'} ${consultationDetails.price}`}
            </p>
          )}
          {isCustomerView &&
            !consultationDetails?.is_enroll &&
            (consultationDetails?.is_paid ? (
              <Link href={`/payment/consultation/${consultationId}`}>
                <div className="w-full md:w-auto bg-primary text-white disabled:bg-gray-300 p-2 text-center rounded-xl shadow hover:bg-primary/80">
                  {'Buy Now'}
                </div>
              </Link>
            ) : (
              <button
                onClick={handleEnrollConsultation}
                disabled={enrolling}
                className="w-full md:w-auto bg-primary text-white disabled:bg-gray-300 p-2 text-center rounded-xl shadow hover:bg-primary/80"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            ))}
          {isCustomerView && consultationDetails?.is_enroll && (
            <p className="break-words text-right line-clamp-1 text-sm font-semibold text-primary">
              {`Enrolled`}
            </p>
          )}
          {/* {!isCustomerView && !consultationDetails?.status && (
            <div className="flex gap-4 items-center">
              <button
                disabled={canceling}
                onClick={handleCancelConsultation}
                className="flex-1 md:w-auto bg-red-500 text-white disabled:bg-red-300/90 p-4 text-center rounded-md shadow hover:bg-red-500/80"
              >
                {canceling ? 'Cancelling...' : 'Cancel Coaching'}
              </button>
              <button
                disabled={completingConsultation}
                onClick={handleConsultationCompletion}
                className="flex-1 md:w-auto bg-primary text-white disabled:bg-primary-300/90 p-4 text-center rounded-md shadow hover:bg-primary/80"
              >
                {completingConsultation ? 'Completing...' : 'Mark as Completed'}
              </button>
            </div>
          )} */}
        </div>
      </div>

      {/* Event Content */}
      <div className="p-4 my-5 bg-white rounded-lg shadow-md text-gray-800 dark:text-gray-200 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="font-bold">Description</p>
          <ControllableText>{consultationDetails?.description || 'Not Available'}</ControllableText>
        </div>
        <div className="flex gap-10">
          <div className="flex gap-2">
            <p className="font-bold">Calender Link:</p>
            <a className="text-gray-500">{consultationDetails?.calender_link}</a>
          </div>
          <div className="flex gap-2">
            <p className="font-bold">Followup Duration:</p>
            <div className="flex items-center gap-3">
              {/* <PiClockCountdown size={24} className="text-primary" /> */}
              <span>{consultationDetails?.followup_duration || '30'} min</span>
            </div>
          </div>
        </div>

        {consultationDetails?.status && (
          <div className="flex flex-col gap-2">
            <p className="font-bold">Status</p>
            <span
              className={`capitalize font-semibold ${
                consultationDetails?.status === 'completed'
                  ? 'text-green-600'
                  : consultationDetails?.status === 'cancelled'
                  ? 'text-red-500'
                  : 'text-yellow-500'
              }`}
            >
              {consultationDetails?.status}
            </span>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <p className="font-bold">Consultation Type</p>
          <div className="flex flex-wrap gap-2">
            {consultationDetails?.consultation_type
              ? consultationDetails?.consultation_type
                  ?.split(',')
                  .map(tag => <ProfileChip key={tag} label={tag} />)
              : consultationDetails?.event_type?.split(',').map(tag => <ProfileChip key={tag} label={tag} />)}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-bold">Followup Type</p>
          <div className="flex flex-wrap gap-2">
            {consultationDetails?.followup_support
              ? consultationDetails?.followup_support
                  ?.split(',')
                  .map(tag => <ProfileChip key={tag} label={tag} />)
              : consultationDetails?.followup_support?.split(',').map(tag => <ProfileChip key={tag} label={tag} />)}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-bold">Tags</p>
          <div className="flex flex-wrap gap-2">
            {consultationDetails?.tags?.map(tag => (
              <ProfileChip key={tag.id} label={tag?.name} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-bold">Categories</p>
          <div className="flex flex-wrap gap-2">
            {consultationDetails?.categories?.map(tag => (
              <ProfileChip key={tag.id} label={tag?.name} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
