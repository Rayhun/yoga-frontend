import axios from '@/lib/axios';

export const getExpertsList = async () => {
  return axios.get('/LMS/experts/');
};

export const addNewExpert = async () => {
  return axios.post('/LMS/experts/');
};
