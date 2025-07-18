'use client';

import dayjs from 'dayjs';
import Image from 'next/image';
import { GoDotFill } from 'react-icons/go';

const EventCard = ({ event, onClick, isExpertView = false }) => {
  return (
    <div
      className="rounded-lg border border-stroke bg-white shadow-default cursor-pointer overflow-hidden dark:bg-boxdark"
      // onClick={onClick}
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
        <h4 className="text-lg block truncate text-black dark:text-white">{event.title}</h4>

        {/* <div className="text-sm text-gray-500">
          {event.event_type}
        </div> */}

        <div className="text-sm text-gray-400 truncate" title={event.agenda}>
          {event.agenda}
        </div>

        <div className="flex gap-1 flex-wrap items-center text-sm text-gray-500">
          <p>{`${event.currency_symbol || '$'} ${event.price}`}</p>
          <GoDotFill size={8} />
          <p className="capitalize">{event.event_type}</p>
          <GoDotFill size={8} />
          <p>{dayjs(event.start_date).format('DD MMM, YYYY')}</p>

          {/* <p>{event.duration} mins</p> */}
        </div>
        {/* {event?.is_paid && event?.price && (
          <p className="break-words line-clamp-1 text-sm font-semibold text-primary">
            {`${event.currency_symbol || '$'} ${event.price}`}
          </p>
        )} */}
        {event?.is_enroll || isExpertView ? (
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

export default EventCard;
