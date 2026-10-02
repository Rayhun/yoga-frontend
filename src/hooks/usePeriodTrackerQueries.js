import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTrackerInfo,
  getPeriodGoal,
  listPeriodDailyGoals,
} from '@/services/private/customer/goal';
import queryKeys from '@/utils/query-keys';

const selectTrackerInfo = response => {
  if (response?.data?.status === 'success') {
    return response.data.data;
  }
  return null;
};

const selectPeriodGoalsList = response => {
  if (response?.data?.status === 'success') {
    return response.data.data;
  }
  return [];
};

const selectPeriodDailyGoalsList = response => {
  if (response?.data?.status === 'success') {
    return response.data.data;
  }
  return [];
};

export function useTrackerInfoQuery(options = {}) {
  return useQuery({
    queryKey: [queryKeys.periodTrackerInfo],
    queryFn: () => getTrackerInfo(),
    select: selectTrackerInfo,
    ...options,
  });
}

export function usePeriodGoalsByMonthQuery(month, options = {}) {
  const { enabled = true, ...rest } = options;

  return useQuery({
    queryKey: [queryKeys.periodGoalsByMonth, month],
    queryFn: () => getPeriodGoal(month),
    enabled: Boolean(month) && enabled,
    select: selectPeriodGoalsList,
    ...rest,
  });
}

export function usePeriodDailyGoalsQuery(params = {}, options = {}) {
  const { start_date: startDate, end_date: endDate } = params;
  const { enabled = true, ...rest } = options;

  return useQuery({
    queryKey: [queryKeys.periodDailyGoals, params],
    queryFn: () => listPeriodDailyGoals(params),
    enabled: Boolean(startDate && endDate) && enabled,
    select: selectPeriodDailyGoalsList,
    ...rest,
  });
}

export function useInvalidatePeriodTrackerQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateTrackerInfo: () =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.periodTrackerInfo] }),
    invalidatePeriodGoals: month =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.periodGoalsByMonth, month] }),
    invalidatePeriodDailyGoals: dailyGoalParams =>
      queryClient.invalidateQueries({
        queryKey: [queryKeys.periodDailyGoals, dailyGoalParams],
      }),
  };
}
