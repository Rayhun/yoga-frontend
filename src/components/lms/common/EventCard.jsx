'use client';

import dayjs from 'dayjs';
import Image from 'next/image';
import { FaPlay, FaCalendarAlt, FaTag } from 'react-icons/fa';

const EventCard = ({ event, onClick, isExpertView = false }) => {
  const isEnrolled = event?.is_enroll || isExpertView;
  
  return (
    <div
      className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      {/* Image Section with Overlay */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          width={300}
          height={169}
          src={event.image || '/images/content/default.png'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <FaPlay className="text-gray-700 ml-1" size={16} />
          </div>
        </div>
        
        {/* Status Badge */}
        {isEnrolled && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Enrolled
          </div>
        )}
      </div>

      {/* Content Section - Flex to push button to bottom */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Title */}
        <h4 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors min-h-[3.5rem]">
          {event.title}
        </h4>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {event.event_type && (
            <div className="flex items-center gap-1">
              <FaTag size={12} className="text-purple-500" />
              <span className="capitalize">{event.event_type}</span>
            </div>
          )}
          {event.start_date && (
            <div className="flex items-center gap-1">
              <FaCalendarAlt size={12} className="text-blue-500" />
              <span>{dayjs(event.start_date).format('DD MMM, YYYY')}</span>
            </div>
          )}
        </div>
        
        {/* Agenda/Description */}
        {event.agenda && (
          <div className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
            {event.agenda}
          </div>
        )}
        
        {/* Price */}
        {event?.price && (
          <div className="flex items-center gap-2 min-h-[1.5rem]">
            <span className="text-lg font-bold text-green-600">
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
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
            isEnrolled
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-200 hover:from-green-200 hover:to-emerald-200 hover:border-green-300'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:from-green-600 hover:to-emerald-700 hover:shadow-xl'
          }`}
        >
          {isEnrolled ? 'View Details' : 'Enroll Now'}
        </button>
      </div>
    </div>
  );
};

export default EventCard;
