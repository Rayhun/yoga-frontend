'use client';
import { useQuery } from '@tanstack/react-query';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import { getFeaturedCategoriesList } from '@/services/private/lms/category';
import queryKeys from '@/utils/query-keys';

const FeaturedCategories = () => {
  const searchParams = useSearchParamUtils();
  const selectedCategory = searchParams.get('category') || 'all';
  const { isLoading: isLoadingCategories, data: categoriesResponse } = useQuery({
    queryFn: getFeaturedCategoriesList,
    queryKey: [queryKeys.lmsFeaturedCategories],
  });

  const handleCategorySelect = selected => {
    if (selected.id === 'all') searchParams.remove('category');
    else searchParams.set('category', selected?.id);
  };

  const featuredCatgories = [{ id: 'all', name: 'All' }, ...(categoriesResponse?.data?.data || [])];

  return (
    <div className="w-full flex gap-3 overflow-auto no-scrollbar">
      {isLoadingCategories ? (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      ) : (
        featuredCatgories.map(category => (
          <div
            key={category.name}
            className={`text-xs md:text-sm border  text-nowrap cursor-pointer px-2 py-1 md:px-4 md:py-2 rounded-full ${
              selectedCategory === category.id?.toString()
                ? 'bg-primary border-primary text-white'
                : 'text-gray-400 border-gray-400'
            }`}
            onClick={() => handleCategorySelect(category)}
          >
            {category.name}
          </div>
        ))
      )}
    </div>
  );
};

export default FeaturedCategories;
