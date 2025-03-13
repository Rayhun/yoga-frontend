'use client';
import { useQuery } from '@tanstack/react-query';
import Spinner from '@/components/common/loader/Spinner';
import { getFeaturedCategoriesList } from '@/services/private/lms/category';
import queryKeys from '@/utils/query-keys';

const FeaturedCategories = ({ selected = [], onSelect = () => null }) => {
  const { isLoading: isLoadingCategories, data: categoriesResponse } = useQuery({
    queryFn: getFeaturedCategoriesList,
    queryKey: [queryKeys.lmsFeaturedCategories],
  });

  const featuredCatgories = [...(categoriesResponse?.data?.data || [])];

  return (
    <div className="w-full flex gap-3 justify-center overflow-auto no-scrollbar">
      {isLoadingCategories ? (
        <Spinner />
      ) : (
        <>
          <div
            className={`text-xs md:text-sm border  text-nowrap cursor-pointer px-2 py-1 md:px-4 md:py-2 rounded-full ${
              selected.length === 0 ? 'bg-primary border-primary text-white' : 'text-gray-400 border-gray-400'
            }`}
            onClick={() => onSelect({})}
          >
            All
          </div>
          {featuredCatgories.map(category => (
            <div
              key={category.name}
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
        </>
      )}
    </div>
  );
};

export default FeaturedCategories;
