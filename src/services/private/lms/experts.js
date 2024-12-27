import axios from '@/lib/axios';

export const getExpertsList = async () => {
  return axios.get('/LMS/experts/');
};
