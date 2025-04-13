import React from 'react';
import Image from 'next/image';
import { Chip } from '@mui/material';
import { FaTv } from 'react-icons/fa';
import { PiClockCountdown } from 'react-icons/pi';
import Link from 'next/link';
import PageLoader from '../loader/PageLoader';

const ProfileChip = ({ label }) => <Chip label={label} className="bg-dark/10 text-dark" />;

export const ConsultationDetails = ({
  consultationDetails,
  isLoading,
  isCustomerView = false,
  consultationId
}) => {
  if (isLoading) return <PageLoader />;

  return (
    <div>
      {/* Event Details Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
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
            <div className="flex items-center gap-3">
              <FaTv size={24} className="text-primary" />
              <span>{consultationDetails?.is_online ? 'Online' : 'Offline'}</span>
            </div>
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
          {isCustomerView && consultationDetails?.is_paid && !consultationDetails?.is_enroll && (
            <Link href={`/payment/consultation/${consultationId}`}>
              <div className="w-full md:w-auto bg-primary text-white disabled:bg-gray-300 p-4 text-center rounded-md shadow hover:bg-primary/80">
                {'Buy Now'}
              </div>
            </Link>
          )}
          {isCustomerView && consultationDetails?.is_enroll && (
            <p className="break-words text-right line-clamp-1 text-sm font-semibold text-primary">
              {`Enrolled`}
            </p>
          )}
        </div>
      </div>

      {/* Event Content */}
      <div className="p-4 my-5 bg-white rounded-lg shadow-md text-gray-800 dark:text-gray-200 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 flex-col gap-5">
          {/* Event Info */}

          {consultationDetails?.recording_link ? (
            <div className="flex flex-col gap-2">
              <h5 className="text-lg text-primary font-bold">Recoding Link</h5>
              <a href={consultationDetails?.recording_link} target="_blank">
                {consultationDetails?.recording_link || 'Not available'}
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <h5 className="text-lg text-primary font-bold">Calender ID</h5>
              <span>{consultationDetails?.calender_link || 'Not available'}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h5 className="text-lg text-primary font-bold">Status</h5>
            <span
              className={`capitalize font-semibold ${
                consultationDetails?.status === 'completed'
                  ? 'text-green-600'
                  : consultationDetails?.status === 'cancelled'
                  ? 'text-red-500'
                  : 'text-yellow-500'
              }`}
            >
              {consultationDetails?.status || 'Not available'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h5 className="text-lg text-primary font-bold">Consultation Type</h5>
          <div className="flex flex-wrap gap-2">
            {consultationDetails?.event_type?.split(',').map(tag => (
              <ProfileChip key={tag} label={tag} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h5 className="text-lg text-primary font-bold">Tags</h5>
          <div className="flex flex-wrap gap-2">
            {consultationDetails?.tags?.map(tag => (
              <ProfileChip key={tag.id} label={tag?.name} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h5 className="text-lg text-primary font-bold">Categories</h5>
          <div className="flex flex-wrap gap-2">
            {consultationDetails?.categories?.map(tag => (
              <ProfileChip key={tag.id} label={tag?.name} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h5 className="text-lg text-primary font-bold">Description</h5>
          <p>{consultationDetails?.description || 'Not Available'}</p>
        </div>
      </div>
    </div>
  );
};
