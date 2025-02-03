import axios from '@/lib/axios';

export const getProgramsList = async ({ category = '' }) => {
  return axios.get(`/customer/program/?category=${category}`);
};

export const getSingleProgram = async ({ id }) => {
  return axios.get(`/customer/program/${id}/`);
};
