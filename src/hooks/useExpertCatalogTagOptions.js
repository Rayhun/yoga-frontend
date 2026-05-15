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
  surface = '',
} = {}) {
  const { data: tagsResponse, isError, error, ...rest } = useQuery({
    queryFn: () =>
      getExpertCatalogTagsList({
        context,
        limit,
        offset,
        ...(search?.trim() ? { search: search.trim() } : {}),
        ...(namespace ? { namespace } : {}),
        ...(surface ? { surface } : {}),
      }),
    queryKey: [queryKeys.expertCatalogTags, context, limit, offset, search, namespace, surface],
    retry: 1,
  });

  const options = useMemo(() => {
    const rows = getExpertCatalogTagsRows(tagsResponse);
    const showNamespace = context !== 'expert_profile';
    return rows.map(row => {
      const aliasText = typeof row.alias === 'string' ? row.alias.trim() : '';
      const base =
        aliasText || row.tag_label || row.canonical_tag || String(row.id);
      const ns = row.namespace_label || row.namespace;
      const label =
        showNamespace && ns ? `${ns}: ${base}` : base;
      return {
        label,
        value: row.id,
      };
    });
  }, [tagsResponse, context]);

  return {
    options,
    isError,
    error,
    ...rest,
  };
}

export default useExpertCatalogTagOptions;
