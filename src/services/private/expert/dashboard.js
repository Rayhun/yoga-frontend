import axios from '@/lib/axios';

export const getAdminExpertDashboard = async ({ start_date, end_date } = {}) => {
  const params = new URLSearchParams();
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);
  
  const queryString = params.toString();
  const url = queryString ? `/admin/expert-dashboard/?${queryString}` : '/admin/expert-dashboard/';
  
  return axios.get(url);
};

export const getExpertDashboard = async ({ start_date, end_date } = {}) => {
  const params = new URLSearchParams();
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);
  
  const queryString = params.toString();
  const url = queryString ? `/expert/dashboard/?${queryString}` : '/expert/dashboard/';
  
  return axios.get(url);
};

export const getAdminDashboardHome = async ({ start_date, end_date } = {}) => {
  const params = new URLSearchParams();
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);
  
  const queryString = params.toString();
  const url = queryString ? `/admin/dashboard-home/?${queryString}` : '/admin/dashboard-home/';
  
  return axios.get(url);
};
