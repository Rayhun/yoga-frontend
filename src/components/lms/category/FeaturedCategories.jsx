'use client';
import Spinner from '@/components/common/loader/Spinner';

const FeaturedCategories = ({ categories = [], selected = [], onSelect = () => null }) => {
  const isFew = categories.length >= 1 && categories.length <= 3;
  return (
    <div
      className={`w-full flex gap-3 overflow-x-auto overflow-y-hidden no-scrollbar pl-4 pr-4 py-1 ${isFew ? 'justify-center' : 'justify-start'}`}
    >
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
