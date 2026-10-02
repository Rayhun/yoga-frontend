'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLmsContentTagsList } from '@/services/private/lms/tag';
import { getExpertCatalogTags } from '@/services/private/lms/catalogTags';
import queryKeys from '@/utils/query-keys';

/** Legacy LMS.Tag options (consultation, group coaching filters) when no catalog context/field is given; otherwise uses the expert catalog tags. */
function useLMSTagOptions({ context, field } = {}) {
  const useCatalog = Boolean(context && field);

  const { data: catalogData } = useQuery({
    queryFn: () => getExpertCatalogTags({ context, field }),
    queryKey: [queryKeys.lmsTags, context, field],
    enabled: useCatalog,
  });

  const { data: tagsResponse } = useQuery({
    queryFn: getLmsContentTagsList,
    queryKey: [queryKeys.lmsTags, 'lms-content-catalog'],
    enabled: !useCatalog,
  });

  const options = useMemo(() => {
    if (useCatalog) {
      return catalogData?.data?.data?.results?.map(option => ({
        label: option.label,
        value: option.id,
      }));
    }
    return (tagsResponse?.data?.data || []).map(option => ({
      label: option.name ?? '',
      value: option.id,
    }));
  }, [useCatalog, catalogData, tagsResponse]);

  return { options };
}

export default useLMSTagOptions;
