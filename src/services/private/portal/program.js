import axios from '@/lib/axios';

export const getProgramsList = async () => {
  return axios.get('/portal/program/');
};

export const getSingleProgram = async ({ id }) => {
  return axios.get(`/portal/program/${id}/`);
};
