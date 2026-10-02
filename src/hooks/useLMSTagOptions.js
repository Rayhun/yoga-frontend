'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTagsList } from '@/services/private/lms/tag';
import { getExpertCatalogTags } from '@/services/private/lms/catalogTags';
import queryKeys from '@/utils/query-keys';

function useLMSTagOptions({ context, field } = {}) {
  const useCatalog = Boolean(context && field);

  const { data: catalogData } = useQuery({
    queryFn: () => getExpertCatalogTags({ context, field }),
    queryKey: [queryKeys.lmsTags, context, field],
    enabled: useCatalog,
  });

  const { data: tagsResponse } = useQuery({
    queryFn: getTagsList,
    queryKey: [queryKeys.lmsTags],
    enabled: !useCatalog,
  });

  const options = useMemo(() => {
    if (useCatalog) {
      return catalogData?.data?.data?.results?.map(option => ({
        label: option.label,
        value: option.id,
      }));
    }
    return tagsResponse?.data?.map(option => ({
      label: option.name,
      value: option.id,
    }));
  }, [useCatalog, catalogData, tagsResponse]);

  return { options };
}

export default useLMSTagOptions;
