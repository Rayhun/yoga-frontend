import axios from '@/lib/axios';

// Creator dashboard (QTE / Institution overview) — read-only aggregates over the caller's own programs.
export const getCreatorDashboardSummary = async () => {
  return axios.get('/certification/creator/dashboard/summary/');
};

export const getCreatorDashboardActivity = async ({ limit = 10 } = {}) => {
  return axios.get('/certification/creator/dashboard/activity/', { params: { limit } });
};
