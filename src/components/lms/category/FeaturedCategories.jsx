'use client';
import { useQuery } from '@tanstack/react-query';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import { getFeaturedCategoriesList } from '@/services/private/lms/category';
import queryKeys from '@/utils/query-keys';

const FeaturedCategories = () => {
  const searchParams = useSearchParamUtils();
  const selectedCategory = searchParams.get('category');
  const { isLoading: isLoadingCategories, data: categoriesResponse } = useQuery({
    queryFn: getFeaturedCategoriesList,
    queryKey: [queryKeys.lmsFeaturedCategories],
  });

  const handleCategorySelect = selected => {
    if (selected.value) searchParams.set('category', selected.value);
  };

  return (
    <div className="w-full flex gap-3 overflow-auto no-scrollbar">
      {isLoadingCategories ? (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      ) : (
        categoriesResponse?.data?.map?.map(category => (
          <div
            key={category.value}
            className={`text-xs md:text-sm border  text-nowrap cursor-pointer px-2 py-1 md:px-4 md:py-2 rounded-full ${
              selectedCategory === category.value.toString()
                ? 'bg-primary border-primary text-white'
                : 'text-gray-400 border-gray-400'
            }`}
            onClick={() => handleCategorySelect(category)}
          >
            {category.label}
          </div>
        ))
      )}
    </div>
  );
};

export default FeaturedCategories;
