import axios from '@/lib/axios';

export const getProgramsList = async () => {
  return axios.get('/customer/program/');
};

export const getSingleProgram = async ({ id }) => {
  return axios.get(`/customer/program/${id}/`);
};
