'use client';
import useLMSCategoryOptions from '@/hooks/useLMSCategoryOptions';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';

const SelectableCategories = () => {
  const searchParams = useSearchParamUtils();
  const selectedCategory = searchParams.get('category');
  const { isLoading: isLoadingOptions, options: categoryOptions } = useLMSCategoryOptions();

  const handleCategorySelect = selected => {
    if (selected.value) searchParams.set('category', selected.value);
  };

  return (
    <div className="w-full flex gap-3 overflow-auto no-scrollbar">
      {isLoadingOptions ? (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      ) : (
        categoryOptions?.map(category => (
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

export default SelectableCategories;
