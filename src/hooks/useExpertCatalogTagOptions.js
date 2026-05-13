'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExpertCatalogTagsList, getExpertCatalogTagsRows } from '@/services/private/lms/expert';
import queryKeys from '@/utils/query-keys';

/**
 * Catalog ``TagAlias`` rows from ``/LMS/experts/catalog-tags/`` (namespaces + ``show_on`` depend on ``context``).
 */
function useExpertCatalogTagOptions({
  context = 'expert_profile',
  limit = 500,
  offset = 0,
  search = '',
  namespace = '',
} = {}) {
  const { data: tagsResponse, ...rest } = useQuery({
    queryFn: () =>
      getExpertCatalogTagsList({
        context,
        limit,
        offset,
        ...(search?.trim() ? { search: search.trim() } : {}),
        ...(namespace ? { namespace } : {}),
      }),
    queryKey: [queryKeys.expertCatalogTags, context, limit, offset, search, namespace],
  });

    const options = useMemo(() => {
    const rows = getExpertCatalogTagsRows(tagsResponse);
    return rows.map(row => {
      const aliasText = typeof row.alias === 'string' ? row.alias.trim() : '';
      return {
        label: aliasText || row.tag_label || row.canonical_tag || String(row.id),
        value: row.id,
      };
    });
  }, [tagsResponse]);

  return {
    options,
    ...rest,
  };
}

export default useExpertCatalogTagOptions;
