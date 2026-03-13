'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import { getLookupsListByCategory } from '@/services/private/lms/expert';

function useLookUpsByCategory(category = 'Coaching Areas') {
  const { data: lookupsResponse } = useQuery({
    queryFn: () => getLookupsListByCategory(category),
    queryKey: [queryKeys.lookupsByCategory, category],
  });

  const categoriesOptions = useMemo(
    () =>
      lookupsResponse?.data?.data?.map((option, index) => ({
        label: option?.title ?? '',
        // Ensure unique value: backend may use id or uuid; fallback to label+index so Autocomplete can distinguish options
        value: option?.id ?? option?.uuid ?? `${option?.title ?? 'item'}-${index}`,
      })) ?? [],
    [lookupsResponse?.data?.data]
  );

  return {
    options: categoriesOptions,
  };
}

export default useLookUpsByCategory;
