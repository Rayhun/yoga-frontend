'use client';
import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getExpertsList, getExpertsListRows } from '@/services/private/lms/expert';
import queryKeys from '@/utils/query-keys';

/** Experts admin list pagination for dropdowns (aligned with backend max batches). */
export const LMS_EXPERTS_FIELD_PAGE_SIZE = 50;

export function expertRowToOption(row) {
  if (!row || row.id == null) return null;
  const name = `${row.first_name || ''} ${row.last_name || ''}`.trim();
  const label = name || row.email || `Expert ${row.id}`;
  return { label, value: row.id };
}

/**
 * LMS experts from ``GET /LMS/experts/`` with ``search`` + limit/offset pagination for dropdown UIs.
 */
function useLmsExpertsFieldOptions({ search = '', enabled = true } = {}) {
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
    queryKey: [queryKeys.lmsExperts, 'field-dropdown', trimmedSearch],
    queryFn: ({ pageParam = 0 }) =>
      getExpertsList({
        limit: LMS_EXPERTS_FIELD_PAGE_SIZE,
        offset: pageParam,
        ...(trimmedSearch ? { search: trimmedSearch } : {}),
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const rows = getExpertsListRows(lastPage);
      const total = lastPage?.data?.data?.count;
      const loaded = allPages.reduce((sum, p) => sum + getExpertsListRows(p).length, 0);
      if (!rows.length) return undefined;
      if (typeof total === 'number' && loaded >= total) return undefined;
      if (rows.length < LMS_EXPERTS_FIELD_PAGE_SIZE) return undefined;
      return loaded;
    },
    retry: 1,
    throwOnError: false,
    enabled,
  });

  const rows = useMemo(() => {
    const pages = data?.pages ?? [];
    const seen = new Set();
    const list = [];
    for (const page of pages) {
      for (const row of getExpertsListRows(page)) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        list.push(row);
      }
    }
    return list;
  }, [data?.pages]);

  const options = useMemo(() => rows.map(row => expertRowToOption(row)).filter(Boolean), [rows]);

  return {
    options,
    fetchNextPage,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    ...rest,
  };
}

export default useLmsExpertsFieldOptions;
