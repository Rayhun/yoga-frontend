'use client';

import { Chip } from '@mui/material';
import dayjs from 'dayjs';
import Image from 'next/image';
import { GoDotFill } from 'react-icons/go';

const ProfileChip = ({ label }) => <Chip label={label} className="bg-dark/10 text-dark capitalize" />;

const ConsultationCard = ({ consultation, onClick }) => {
  return (
    <div
      className="rounded-lg border border-stroke bg-white shadow-default overflow-hidden dark:bg-boxdark"
      // onClick={onClick}
    >
      <div className="aspect-[16/9]">
        <Image
          width={200}
          height={200}
          src={consultation.image || '/images/content/default.png'}
          alt="event-image"
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h4 className="text-lg font-semibold text-black dark:text-white">{consultation.title}</h4>

        <div className="flex gap-1 items-center text-sm text-gray-500">
          {consultation.event_type
            ? consultation?.event_type?.split(',').map(type => <ProfileChip key={type} label={type} />)
            : consultation?.consultation_type
                ?.split(',')
                .map(type => <ProfileChip key={type} label={type} />)}
        </div>

        {/* <div className="text-sm text-gray-400 truncate" title={consultation.description}>
          {consultation.description}
        </div> */}

        {/* Event Date, Time and Duration */}
        <div className="flex gap-1 items-center text-sm text-gray-500">
          {consultation?.is_paid && consultation?.price ? (
            <p>{`${consultation.currency_symbol || '$'} ${consultation.price}`}</p>
          ) : (
            <p>Free</p>
          )}
          <GoDotFill size={8} />
          <p>{dayjs(consultation.start_date).format('DD MMM, YYYY')}</p>
          <GoDotFill size={8} />
          <p>{consultation.duration} mins</p>
        </div>

        {/* {consultation?.is_paid && consultation?.price && (
          <p className="break-words line-clamp-1 text-sm font-semibold text-primary">
            {`${consultation.currency_symbol || '$'} ${consultation.price}`}
          </p>
        )} */}

        {consultation?.is_enroll ? (
          <button
            onClick={onClick}
            className="w-full mt-4 py-1 px-4 border border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-colors duration-200 font-medium text-sm"
          >
            View Details
          </button>
        ) : (
          <button
            onClick={onClick}
            className="w-full mt-4 py-1 px-4 border border-primary text-primary rounded-xl bg-primary text-white transition-colors duration-200 font-medium text-sm"
          >
            Enroll Now
          </button>
        )}
      </div>
    </div>
  );
};

export default ConsultationCard;
