import { FaUser } from 'react-icons/fa';
import ExpertCoverImage from '@/components/common/ExpertCoverImage';

const getPracticeTypeLabel = expert => {
  if (typeof expert?.practice_type === 'string' && expert.practice_type.trim()) {
    return expert.practice_type.trim();
  }
  if (expert?.practice_type?.label) return expert.practice_type.label;
  return expert?.title?.trim() || '';
};

const ExpertCard = ({ expert, onClick }) => {
  const practiceType = getPracticeTypeLabel(expert);
  const expertName = `${expert.first_name || ''} ${expert.last_name || ''}`.trim();

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full flex flex-col dark:bg-boxdark dark:border-gray-700"
      onClick={onClick}
    >
      {/* Image Section with Overlay */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <ExpertCoverImage
          src={expert.file}
          name={expertName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content Section - Flex to push button to bottom */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Name */}
        <h4 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors dark:text-white">
          {expert.first_name} {expert.last_name ? expert.last_name : ''}
        </h4>

        {practiceType ? (
          <p className="text-sm text-gray-500 line-clamp-1">{practiceType}</p>
        ) : null}
        {/* Title and Specialization */}
        {/* {expert?.title && (
          <div className="flex items-center gap-2 text-sm text-gray-600 min-h-[1.25rem]">
            <FaBriefcase size={12} className="text-blue-500" />
            <span className="line-clamp-1">{expert.title}</span>
          </div>
        )} */}
        
        
        {/* Experience */}
        <div className="flex items-center gap-2 text-sm text-gray-600 min-h-[1.25rem]">
          <FaUser size={12} className="text-green-500" />
          <span>{expert?.experience_years || 0} years experience</span>
        </div>

        {/* Specialization */}
        {expert?.specialization && (() => {
          const raw = expert.specialization;
          const list = Array.isArray(raw)
            ? raw.filter(Boolean)
            : String(raw ?? '')
                .split(',')
                .map(item => item.trim())
                .filter(Boolean);

          if (!list.length) return null;

          const isSingle = list.length === 1;
          const displayText = isSingle
            ? list[0]
            : list[0]
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 5)
                .join(' ');
          const extraCount = list.length > 1 ? list.length - 1 : 0;

          return (
            <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs text-gray-700">
              <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] text-green-600">
                ★
              </span>
              <span className="min-w-0 truncate font-medium">{displayText}</span>
              {extraCount > 0 && (
                <span className="inline-flex flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                  +{extraCount}
                </span>
              )}
            </div>
          );
        })()}
        
        {/* Bio */}
        {/* <div 
          className="bio-content break-words line-clamp-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed [&>p]:mb-0 [&>p]:line-clamp-2 [&>p]:text-sm [&>p]:text-gray-600 [&>p]:dark:text-gray-300 [&>strong]:font-semibold [&>em]:italic [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4"
          title={expert.bio ? expert.bio.replace(/<[^>]*>/g, '') : 'No bio available'}
          dangerouslySetInnerHTML={{ __html: expert.bio || '<p class="text-gray-500 dark:text-gray-400">No bio available</p>' }}
        /> */}
        
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
