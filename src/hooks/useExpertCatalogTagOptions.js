'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExpertCatalogTagsList, getExpertCatalogTagsRows } from '@/services/private/lms/expert';
import queryKeys from '@/utils/query-keys';

/**
 * Tag app catalog tags for expert profiles (namespaces / canonical tags).
 */
function useExpertCatalogTagOptions({ limit = 500, offset = 0, search = '', namespace = '' } = {}) {
  const { data: tagsResponse, ...rest } = useQuery({
    queryFn: () =>
      getExpertCatalogTagsList({
        limit,
        offset,
        ...(search?.trim() ? { search: search.trim() } : {}),
        ...(namespace ? { namespace } : {}),
      }),
    queryKey: [queryKeys.expertCatalogTags, limit, offset, search, namespace],
  });

  const options = useMemo(() => {
    const rows = getExpertCatalogTagsRows(tagsResponse);
    return rows.map(row => ({
      label: row.namespace_label ? `${row.namespace_label}: ${row.label}` : row.label,
      value: row.id,
    }));
  }, [tagsResponse]);

  return {
    options,
    ...rest,
  };
}

export default useExpertCatalogTagOptions;
