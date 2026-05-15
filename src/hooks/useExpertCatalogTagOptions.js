'use client';
import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  getExpertCatalogTagsList,
  getExpertCatalogTagsRows,
  getExpertCatalogTagSchema,
} from '@/services/private/lms/expert';
import queryKeys from '@/utils/query-keys';

/** Page size for catalog tag dropdown infinite scroll (backend max 500). */
export const CATALOG_TAGS_PAGE_SIZE = 100;

/**
 * Catalog ``TagAlias`` rows from ``/LMS/experts/catalog-tags/`` with scroll-to-load-more.
 * Namespaces + ``show_on`` depend on ``context``; API also returns ``tag_schema`` (from CONTENT_TAG_SCHEMA).
 */
function useExpertCatalogTagOptions({
  context = 'expert_profile',
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
      trimmedSearch,
      namespace,
      surface,
    ],
    queryFn: ({ pageParam = 0 }) =>
      getExpertCatalogTagsList({
        context,
        limit: CATALOG_TAGS_PAGE_SIZE,
        offset: pageParam,
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

  const options = useMemo(() => {
    const pages = data?.pages ?? [];
    const showNamespace = context !== 'expert_profile';
    const byId = new Map();
    for (const page of pages) {
      const rows = getExpertCatalogTagsRows(page);
      for (const row of rows) {
        if (byId.has(row.id)) continue;
        const aliasText = typeof row.alias === 'string' ? row.alias.trim() : '';
        const base =
          aliasText || row.tag_label || row.canonical_tag || String(row.id);
        const ns = row.namespace_label || row.namespace;
        const label = showNamespace && ns ? `${ns}: ${base}` : base;
        byId.set(row.id, { label, value: row.id });
      }
    }
    return Array.from(byId.values());
  }, [data?.pages, context]);

  const tagSchema = useMemo(() => {
    const first = data?.pages?.[0];
    return getExpertCatalogTagSchema(first) ?? null;
  }, [data?.pages]);

  const catalogRows = useMemo(() => {
    const pages = data?.pages ?? [];
    const showNamespace = context !== 'expert_profile';
    const byId = new Map();
    for (const page of pages) {
      for (const row of getExpertCatalogTagsRows(page)) {
        if (byId.has(row.id)) continue;
        const aliasText = typeof row.alias === 'string' ? row.alias.trim() : '';
        const base =
          aliasText || row.tag_label || row.canonical_tag || String(row.id);
        const ns = row.namespace_label || row.namespace;
        const primaryLabel = showNamespace && ns ? `${ns}: ${base}` : base;
        byId.set(row.id, {
          id: row.id,
          primaryLabel,
          namespace: ns,
          raw: row,
        });
      }
    }
    return Array.from(byId.values());
  }, [data?.pages, context]);

  return {
    options,
    catalogRows,
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
