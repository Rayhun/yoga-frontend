'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTagsList } from '@/services/private/lms/tag';
import queryKeys from '@/utils/query-keys';

function useLMSTagOptions() {
  const { data: tagsResponse } = useQuery({
    queryFn: getTagsList,
    queryKey: [queryKeys.lmsTags],
  });

  const categoriesOptions = useMemo(
    () =>
      tagsResponse?.data?.map(option => ({
        label: option.name,
        value: option.id,
      })),
    [tagsResponse?.data]
  );

  return {
    options: categoriesOptions,
  };
}

export default useLMSTagOptions;
