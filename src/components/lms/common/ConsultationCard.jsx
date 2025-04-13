'use client';

import dayjs from 'dayjs';
import Image from 'next/image';
import { GoDotFill } from 'react-icons/go';

const ConsultationCard = ({ consultation, onClick }) => {
  return (
    <div
      className="rounded-lg border border-stroke bg-white shadow-default cursor-pointer overflow-hidden dark:bg-boxdark"
      onClick={onClick}
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
        <h4 className="text-lg font-semibold text-black dark:text-white">
          {consultation.title}
        </h4>

        <div className="text-sm text-gray-500">{consultation.event_type}</div>

        <div className="text-sm text-gray-400 truncate" title={consultation.description}>
          {consultation.description}
        </div>

        {/* Event Date, Time and Duration */}
        <div className="flex gap-1 items-center text-sm text-gray-500">
          <p>{dayjs(consultation.start_date).format('MMM DD, YYYY')}</p>
          <GoDotFill size={8} />
          <p>{dayjs(consultation.start_date).format('h:mm A')}</p>
          <GoDotFill size={8} />
          <p>{consultation.duration} mins</p>
        </div>

        {consultation?.is_paid && consultation?.price && (
          <p className="break-words line-clamp-1 text-sm font-semibold text-primary">
            {`${consultation.currency_symbol || '$'} ${consultation.price}`}
          </p>
        )}
      </div>
    </div>
  );
};

export default ConsultationCard;
