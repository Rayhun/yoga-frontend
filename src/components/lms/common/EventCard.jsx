'use client';

import dayjs from 'dayjs';
import Image from 'next/image';
import { GoDotFill } from 'react-icons/go';

const EventCard = ({ event, onClick }) => {
  return (
    <div
      className="rounded-lg border border-stroke bg-white shadow-default cursor-pointer overflow-hidden dark:bg-boxdark"
      onClick={onClick}
    >
      <div className="aspect-[16/9]">
        <Image
          width={200}
          height={200}
          src={event.image}
          alt="event-image"
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>

      <div className="p-4 flex flex-col gap-1">
        <h4 className="text-lg font-semibold block truncate text-black dark:text-white">
          {event.title}
        </h4>

        <div className="text-sm text-gray-500">
          {event.event_type}
        </div>

        <div className="text-sm text-gray-400 truncate" title={event.agenda}>
          {event.agenda}
        </div>

        <div className="flex gap-1 items-center text-sm text-gray-500">
          <p>{dayjs(event.start_date).format('MMM DD, YYYY')}</p>
          <GoDotFill size={8} />
          <p>{dayjs(event.start_date).format('h:mm A')}</p>
          <GoDotFill size={8} />
          <p>{event.duration} mins</p>
        </div>
        {event?.is_paid && event?.price && (
          <p className="break-words line-clamp-1 text-sm font-semibold text-primary">
            {`${event.currency_symbol} ${event.price}`}
          </p>
        )}
      </div>
    </div>
  );
};

export default EventCard;
