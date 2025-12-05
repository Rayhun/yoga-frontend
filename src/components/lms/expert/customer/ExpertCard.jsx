import Image from 'next/image';
import { FaUser, FaBriefcase, FaAward } from 'react-icons/fa';

const ExpertCard = ({ expert, onClick }) => {
  return (
    <div
      className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full flex flex-col dark:bg-boxdark dark:border-gray-700"
      onClick={onClick}
    >
      {/* Image Section with Overlay */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          width={300}
          height={169}
          src={expert.file?.startsWith('http') ? expert.file : '/images/user/placeholder_profile.png'}
          alt={`${expert.first_name} ${expert.last_name ? expert.last_name : ''}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          quality={95}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content Section - Flex to push button to bottom */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Name */}
        <h4 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors dark:text-white min-h-[3.5rem]">
          {expert.first_name} {expert.last_name ? expert.last_name : ''}
        </h4>
        
        {/* Title and Specialization */}
        {/* {expert?.title && (
          <div className="flex items-center gap-2 text-sm text-gray-600 min-h-[1.25rem]">
            <FaBriefcase size={12} className="text-blue-500" />
            <span className="line-clamp-1">{expert.title}</span>
          </div>
        )} */}
        
        {/* Specialization */}
        {expert?.specialization && (
          <div className="flex items-center gap-2 text-sm text-gray-600 min-h-[1.25rem]">
            <FaAward size={12} className="text-purple-500" />
            <span className="line-clamp-1">{expert.specialization}</span>
          </div>
        )}
        
        {/* Experience */}
        <div className="flex items-center gap-2 text-sm text-gray-600 min-h-[1.25rem]">
          <FaUser size={12} className="text-green-500" />
          <span>{expert?.experience_years || 0} years experience</span>
        </div>
        
        {/* Bio */}
        <p className="break-words line-clamp-2 text-sm text-gray-500 dark:text-gray-400" title={expert.bio}>
          {expert.bio || 'No bio available'}
        </p>
        
        {/* Categories */}
        {expert?.categories && expert.categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {expert.categories.slice(0, 2).map((category, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full dark:bg-primary/20"
              >
                {category.name}
              </span>
            ))}
            {expert.categories.length > 2 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full dark:bg-gray-700 dark:text-gray-300">
                +{expert.categories.length - 2} more
              </span>
            )}
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
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:from-green-600 hover:to-emerald-700 hover:shadow-xl"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ExpertCard;
