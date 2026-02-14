'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Image from 'next/image';
import { FaPlay, FaCalendarAlt, FaTag } from 'react-icons/fa';
import { getUserTimeAndTimezone } from '@/utils/helpers';

dayjs.extend(utc);

const EventCard = ({ event, onClick, isExpertView = false }) => {
  const isEnrolled = event?.is_enroll || isExpertView;
  
  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      {/* Image Section with Overlay */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
        <Image
          width={300}
          height={169}
          src={event.image || '/images/content/default.png'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Play Button Overlay */}
        {/* <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300">
            <FaPlay className="text-white ml-1" size={18} />
          </div>
        </div> */}
        
        {/* Status Badge - Only show for enrolled events, not in expert view */}
        {event?.is_enroll && !isExpertView && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border-2 border-white/30">
            Enrolled
          </div>
        )}
      </div>

      {/* Content Section - Flex to push button to bottom */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Title */}
        <h4 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors min-h-[3.5rem]">
          {event.title}
        </h4>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
          {event.event_type && (
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">
              <FaTag size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span className="capitalize font-medium">{event.event_type}</span>
            </div>
          )}
          {event.start_date && (
            <div className="flex items-center gap-1.5">
              <FaCalendarAlt size={12} className="text-emerald-600 dark:text-emerald-400" />
              {(() => {
                const originalDate = dayjs.utc(event.start_date).format('DD MMM, YYYY');
                if (!event.time_zone) return <span>{originalDate}</span>;
                const result = getUserTimeAndTimezone(event.start_date, event.time_zone);
                const userDate = result.userTime.format('DD MMM, YYYY');
                // If date changed due to timezone, show user's date only
                return <span>{userDate !== originalDate ? userDate : originalDate}</span>;
              })()}
            </div>
          )}
        </div>
        
        {/* Agenda/Description */}
        {event.agenda && (
          <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
            {event.agenda}
          </div>
        )}
        
        {/* Price */}
        {event?.price && (
          <div className="flex items-center gap-2 min-h-[1.5rem]">
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {event.currency_symbol || '$'} {event.price}
            </span>
          </div>
        )}
        
        {/* Spacer to push button to bottom */}
        <div className="flex-1"></div>
        
        {/* Action Button - Always at bottom */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
            isEnrolled
              ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-800 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-900/40 dark:hover:to-green-900/40 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm hover:shadow-md'
              : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-green-700 hover:shadow-xl hover:shadow-emerald-500/40'
          }`}
        >
          {isEnrolled ? 'View Details' : 'Enroll Now'}
        </button>
      </div>
    </div>
  );
};

export default EventCard;
