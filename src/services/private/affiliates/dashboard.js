import axios from '@/lib/axios';

export const getAffiliatesUsersAdminDashboard = async () => {
  return axios.get(`/admin/affiliate-dashboard/`);
};

export const getAffiliatesUsersDashboard = async () => {
  return axios.get(`/affiliate-dashboard/`);
};

export const getAffiliateTransactions = async (params = {}) => {
  return axios.get(`/affiliate-transactions/`, { params });
};
