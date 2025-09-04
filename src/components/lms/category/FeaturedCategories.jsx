'use client';
import Spinner from '@/components/common/loader/Spinner';

const FeaturedCategories = ({ categories = [], selected = [], onSelect = () => null }) => {
  return (
    <div className="w-full flex gap-3 justify-center overflow-auto no-scrollbar">
      {categories.map(category => (
        <div
          key={category.id}
          className={`text-xs md:text-sm border  text-nowrap cursor-pointer px-2 py-1 md:px-4 md:py-2 rounded-full ${
            selected.includes(category.id)
              ? 'bg-primary border-primary text-white'
              : 'text-gray-400 border-gray-400'
          }`}
          onClick={() => onSelect(category)}
        >
          {category.name}
        </div>
      ))}
    </div>
  );
};

export default FeaturedCategories;
