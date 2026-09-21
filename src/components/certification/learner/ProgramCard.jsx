import Image from 'next/image';
import { FaPlay, FaUser, FaBookOpen } from 'react-icons/fa';

const CREATOR_TYPE_LABELS = {
  qte: 'Coach',
  expert: 'Coach',
  institution: 'Institution',
};

const TARGET_AUDIENCE_LABELS = {
  career: 'Career Track',
  professional: 'Professional Track',
  both: 'Career & Professional',
};

const ProgramCard = ({ program, onClick }) => {
  const isEnrolled = program?.is_enrolled || program?.enroll_status;
  const isFull = program.seat_limit !== null && program.seats_remaining === 0;
  const isFree = program.payment_type === 'free';

  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full flex flex-col ${isFull ? 'opacity-70' : ''}`}
      onClick={onClick}
    >
      {/* Image Section with Overlay */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          width={300}
          height={169}
          src={program.thumbnail || '/images/content/default.png'}
          alt={program.title}
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

        {/* Creator Type Badge */}
        {program.creator_type && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
            {CREATOR_TYPE_LABELS[program.creator_type] || 'Coach'}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Audience Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {TARGET_AUDIENCE_LABELS[program.target_audience] || program.target_audience}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors min-h-[3.5rem]">
          {program.title}
        </h4>

        {/* Creator Name */}
        {program.creator_display_name && (
          <p className="text-sm text-gray-500">By {program.creator_display_name}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FaBookOpen size={12} className="text-green-500" />
            <span>{program.module_count || 0} modules</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-green-600">
            {isFree ? 'Free' : `${program.currency || 'USD'} ${program.price}`}
          </span>
          {isEnrolled ? (
            <button
              onClick={e => {
                e.stopPropagation();
                onClick();
              }}
              className="py-2 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-200 hover:from-green-200 hover:to-emerald-200 hover:border-green-300 transition-all"
            >
              Continue
            </button>
          ) : isFull ? (
            <span className="text-sm font-semibold text-red-500">Full</span>
          ) : (
            <button
              onClick={e => {
                e.stopPropagation();
                onClick();
              }}
              className="py-2 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:from-green-600 hover:to-emerald-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramCard;
