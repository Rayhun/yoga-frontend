'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTagsList } from '@/services/private/lms/tag';
import queryKeys from '@/utils/query-keys';

function useLMSTagOptions() {
  const { data: tagsResponse } = useQuery({
    queryFn: () => getTagsList({ limit: 1000, offset: 0 }),
    queryKey: [queryKeys.lmsTags],
  });

  const categoriesOptions = useMemo(
    () =>
      (tagsResponse?.data?.data?.results || []).map(option => ({
        label: option.label,
        value: option.id,
      })),
    [tagsResponse?.data?.data?.results]
  );

  return {
    options: categoriesOptions,
  };
}

export default useLMSTagOptions;
