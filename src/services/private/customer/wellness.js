import axios from '@/lib/axios';

export const getWellnessDashboard = async () => {
  return axios.get('/wellness/dashboard/');
};
