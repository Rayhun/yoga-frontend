import Image from 'next/image';
import { GoDotFill } from 'react-icons/go';

const ExpertCard = ({ expert, onClick }) => {
  return (
    <div
      className="rounded-lg border border-stroke bg-white shadow-default overflow-hidden dark:bg-boxdark cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="aspect-[16/9]">
        <Image
          width={400}
          height={225}
          src={expert.file?.startsWith('http') ? expert.file : '/images/user/placeholder_profile.png'}
          alt={`${expert.first_name} ${expert.last_name ? expert.last_name : ''}`}
          className="w-full h-full object-cover rounded-t-lg"
          quality={95}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <div className="p-4 flex flex-col gap-1">
        <h4 className="text-lg font-semibold block truncate text-black dark:text-white">
          {expert.first_name} {expert.last_name ? expert.last_name : ''}
        </h4>
        
        <div className="flex gap-1 flex-wrap items-center text-sm text-gray-500">
          {expert?.title && (
            <>
              <p className="truncate">{expert.title}</p>
              <GoDotFill size={8} />
            </>
          )}
          {expert?.specialization && (
            <>
              <p className="truncate">{expert.specialization}</p>
              <GoDotFill size={8} />
            </>
          )}
          <p>{expert?.experience_years || 0} years experience</p>
        </div>
        
        <p className="break-words line-clamp-2 text-sm text-gray-400" title={expert.bio}>
          {expert.bio || 'No bio available'}
        </p>
        
        <div className="flex gap-2 mt-2">
          {expert?.categories?.slice(0, 2).map((category, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
            >
              {category.name}
            </span>
          ))}
          {expert?.categories?.length > 2 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{expert.categories.length - 2} more
            </span>
          )}
        </div>

        <button
          className="w-full mt-4 py-1 px-4 border border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-colors duration-200 font-medium text-sm"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ExpertCard;
