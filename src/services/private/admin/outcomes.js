import axios from '@/lib/axios';

export const getAdminOutcomesDashboard = async (params = {}) =>
  axios.get('/LMS/outcomes-dashboard/', { params });
