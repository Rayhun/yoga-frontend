import axios from '@/lib/axios';

export const getProgramsList = async ({ category = '' }) => {
  return axios.get(`/customer/program/?category=${category}`);
};

export const getSingleProgram = async ({ id }) => {
  return axios.get(`/customer/program/${id}/`);
};

export const enrollProgram = async ({ id }) => {
  return axios.post(`/customer/program/${id}/enroll/`);
};
