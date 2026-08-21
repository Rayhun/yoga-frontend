'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import { getLookupsListByCategory } from '@/services/private/lms/expert';

function useLookUpsByCategory(category = 'Coaching Areas') {
  const { isLoading, isError, data: lookupsResponse } = useQuery({
    queryFn: () => getLookupsListByCategory(category),
    queryKey: [queryKeys.lookupsByCategory, category],
  });

  const categoriesOptions = useMemo(
    () =>
      lookupsResponse?.data?.data?.map(option => ({
        label: option?.title ?? '',
        value: option?.id,
      })) ?? [],
    [lookupsResponse?.data?.data]
  );

  return {
    isLoading,
    isError,
    options: categoriesOptions,
  };
}

export default useLookUpsByCategory;
