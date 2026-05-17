'use client';
import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  getExpertCatalogTagsList,
  getExpertCatalogTagsRows,
  getExpertCatalogTagSchema,
} from '@/services/private/lms/expert';
import queryKeys from '@/utils/query-keys';
import {
  getCatalogTagNamespaceLabel,
  getCatalogTagRowLabel,
  groupCatalogRowsByNamespace,
} from '@/utils/catalogTag';

/** Page size for catalog tag dropdown infinite scroll (backend max 500). */
export const CATALOG_TAGS_PAGE_SIZE = 100;

/**
 * Catalog ``Tag`` rows from ``/LMS/experts/catalog-tags/`` with scroll-to-load-more.
 * Namespaces depend on ``context``; API also returns ``tag_schema`` (from CONTENT_TAG_SCHEMA).
 */
function useExpertCatalogTagOptions({
  context = 'expert_profile',
  field = '',
  search = '',
  namespace = '',
  surface = '',
  enabled = true,
} = {}) {
  const trimmedSearch = typeof search === 'string' ? search.trim() : '';

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    ...rest
  } = useInfiniteQuery({
    queryKey: [
      queryKeys.expertCatalogTags,
      'infinite',
      context,
      field,
      trimmedSearch,
      namespace,
      surface,
    ],
    queryFn: ({ pageParam = 0 }) =>
      getExpertCatalogTagsList({
        context,
        limit: CATALOG_TAGS_PAGE_SIZE,
        offset: pageParam,
        ...(field ? { field } : {}),
        ...(trimmedSearch ? { search: trimmedSearch } : {}),
        ...(namespace ? { namespace } : {}),
        ...(surface !== undefined && surface !== '' ? { surface } : {}),
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const rows = getExpertCatalogTagsRows(lastPage);
      const total = lastPage?.data?.data?.count;
      const loaded = allPages.reduce((sum, p) => sum + getExpertCatalogTagsRows(p).length, 0);
      if (!rows.length) return undefined;
      if (typeof total === 'number' && loaded >= total) return undefined;
      if (rows.length < CATALOG_TAGS_PAGE_SIZE) return undefined;
      return loaded;
    },
    retry: 1,
    enabled,
  });

  const tagSchema = useMemo(() => {
    const first = data?.pages?.[0];
    return getExpertCatalogTagSchema(first) ?? null;
  }, [data?.pages]);

  const namespaceOrder = useMemo(
    () => (tagSchema ? Object.keys(tagSchema) : null),
    [tagSchema]
  );

  const catalogRows = useMemo(() => {
    const pages = data?.pages ?? [];
    const byId = new Map();
    for (const page of pages) {
      for (const row of getExpertCatalogTagsRows(page)) {
        if (byId.has(row.id)) continue;
        byId.set(row.id, {
          id: row.id,
          label: getCatalogTagRowLabel(row),
          namespace: row.namespace,
          namespaceLabel: getCatalogTagNamespaceLabel(row),
          raw: row,
        });
      }
    }
    return Array.from(byId.values());
  }, [data?.pages]);

  const groupedCatalogRows = useMemo(
    () => groupCatalogRowsByNamespace(catalogRows, { namespaceOrder }),
    [catalogRows, namespaceOrder]
  );

  const options = useMemo(
    () => catalogRows.map(r => ({ label: r.label, value: r.id })),
    [catalogRows]
  );

  return {
    options,
    catalogRows,
    groupedCatalogRows,
    tagSchema,
    fetchNextPage,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    ...rest,
  };
}

export default useExpertCatalogTagOptions;
