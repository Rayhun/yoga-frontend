'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategoriesList } from '@/services/private/lms/category';
import queryKeys from '@/utils/query-keys';

function useLMSCategoryOptions() {
  const { isLoading, data: categoriesResponse } = useQuery({
    queryFn: getCategoriesList,
    queryKey: [queryKeys.lmsCategories],
  });

  const categoriesOptions = useMemo(
    () =>
      categoriesResponse?.data?.map(option => ({
        label: option.name,
        value: option.id,
      })),
    [categoriesResponse?.data]
  );

  return {
    isLoading,
    options: categoriesOptions,
  };
}

export default useLMSCategoryOptions;
