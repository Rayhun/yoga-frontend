'use client';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import { getCreatorDashboardActivity, getCreatorDashboardSummary } from '@/services/private/certification/creatorDashboard';

const STALE_TIME = 60 * 1000;
export const ACTIVITY_LIMIT = 10;

/**
 * The two dashboard requests, kept independent so one failing never blanks the other. `enabled` must be
 * false for every creator that is not approved: the backend answers 403 for them anyway.
 * Keys: ['creator-dashboard', 'summary'] and ['creator-dashboard', 'activity'].
 */
const useCreatorDashboard = ({ enabled }) => {
  const summary = useQuery({
    queryKey: [queryKeys.creatorDashboard, 'summary'],
    queryFn: getCreatorDashboardSummary,
    select: res => res?.data?.data,
    enabled,
    staleTime: STALE_TIME,
    retry: 1,
  });
  const activity = useQuery({
    queryKey: [queryKeys.creatorDashboard, 'activity'],
    queryFn: () => getCreatorDashboardActivity({ limit: ACTIVITY_LIMIT }),
    select: res => res?.data?.data,
    enabled,
    staleTime: STALE_TIME,
    retry: 1,
  });
  return { summary, activity };
};

export default useCreatorDashboard;
