import Image from 'next/image';
import { FaPlay, FaBookOpen, FaCheckCircle, FaAward } from 'react-icons/fa';

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
  const isComplete = program?.enroll_status === 'Complete';
  const progress = program?.progress || 0;

  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full flex flex-col ${isFull && !isEnrolled ? 'opacity-70' : ''}`}
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          width={300}
          height={169}
          src={program.thumbnail || '/images/content/default.png'}
          alt={program.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <FaPlay className="text-gray-700 ml-1" size={16} />
          </div>
        </div>
        {isEnrolled && (
          <div className={`absolute top-3 right-3 text-white px-2 py-1 rounded-full text-xs font-medium ${
            isComplete ? 'bg-primary' : 'bg-orange-500'
          }`}>
            {isComplete ? 'Completed' : 'In Progress'}
          </div>
        )}
        {program.creator_type && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
            {CREATOR_TYPE_LABELS[program.creator_type] || 'Coach'}
          </div>
        )}
      </div>

      {/* Content Section - Flex to push button to bottom */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {TARGET_AUDIENCE_LABELS[program.target_audience] || program.target_audience}
          </span>
        </div>

        <h4 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors min-h-[3.5rem]">
          {program.title}
        </h4>

        {program.creator_display_name && (
          <p className="text-sm text-gray-500">By {program.creator_display_name}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FaBookOpen size={12} className="text-green-500" />
            <span>{program.module_count || 0} modules</span>
          </div>
          <div className="flex items-center gap-1">
            <FaAward size={12} className="text-blue-500" />
            <span>{program.lesson_count || 0} lessons</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 min-h-[1.5rem]">
          <span className="text-lg font-bold text-green-600">
            {isFree ? 'Free' : `${program.currency || 'USD'} ${program.price}`}
          </span>
          {!isFree && <span className="text-sm text-gray-500">one-time</span>}
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        {/* Progress bar for enrolled */}
        {isEnrolled && !isComplete && progress > 0 && (
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Action Button - Always at bottom */}
        {isComplete ? (
          <div className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-200 flex items-center justify-center gap-2">
            <FaCheckCircle size={14} /> Completed
          </div>
        ) : isEnrolled ? (
          <button
            onClick={e => { e.stopPropagation(); onClick(); }}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-200 hover:from-green-200 hover:to-emerald-200 hover:border-green-300 transition-all"
          >
            Continue Certificate
          </button>
        ) : isFull ? (
          <div className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-center text-red-500">
            Full
          </div>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onClick(); }}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:from-green-600 hover:to-emerald-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Start Certificate
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgramCard;
