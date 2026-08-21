import axios from '@/lib/axios';
import { API_V2_BASE_URL } from '@/utils/config';

export const getAdminExpertDashboard = async ({ start_date, end_date } = {}) => {
  const params = new URLSearchParams();
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);

  const queryString = params.toString();
  const url = queryString ? `/admin/expert-dashboard/?${queryString}` : '/admin/expert-dashboard/';

  return axios.get(url);
};

/** @deprecated Old LMS expert dashboard — kept for reference, not used by teacher home */
export const getExpertDashboard = async ({ start_date, end_date } = {}) => {
  const params = new URLSearchParams();
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);

  const queryString = params.toString();
  const url = queryString ? `/expert/dashboard/?${queryString}` : '/expert/dashboard/';

  return axios.get(url);
};

export const getExpertHomeDashboard = async () => {
  return axios.get(`${API_V2_BASE_URL}/expert/dashboard/`);
};

export const getExpertCircleCompositionSnapshot = async () => {
  return axios.get(`${API_V2_BASE_URL}/expert/dashboard/circle-composition/`);
};

export const getExpertCircleWellnessInsights = async (period = 'week') => {
  return axios.get(`${API_V2_BASE_URL}/expert/dashboard/wellness-insights/`, {
    params: { period },
  });
};

export const getAdminDashboardHome = async ({ start_date, end_date } = {}) => {
  const params = new URLSearchParams();
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);

  const queryString = params.toString();
  const url = queryString ? `/admin/dashboard-home/?${queryString}` : '/admin/dashboard-home/';

  return axios.get(url);
};
