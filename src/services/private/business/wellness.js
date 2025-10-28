import axios from '@/lib/axios';

// Business Wellness Dashboard API calls

export const getBusinessWellnessDashboard = async () => {
  return axios.get('/auth/business-wellness-dashboard/');
};
