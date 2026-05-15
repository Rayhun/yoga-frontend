'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLmsContentTagsList } from '@/services/private/lms/tag';
import queryKeys from '@/utils/query-keys';

/** Legacy LMS.Tag options (consultation, group coaching filters). Content uses ``useExpertCatalogTagOptions``. */
function useLMSTagOptions() {
  const { data: tagsResponse } = useQuery({
    queryFn: getLmsContentTagsList,
    queryKey: [queryKeys.lmsTags, 'lms-content-catalog'],
  });

  const categoriesOptions = useMemo(
    () =>
      (tagsResponse?.data?.data || []).map(option => ({
        label: option.name ?? '',
        value: option.id,
      })),
    [tagsResponse?.data?.data]
  );

  return {
    options: categoriesOptions,
  };
}

export default useLMSTagOptions;
