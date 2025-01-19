import axios from '@/lib/axios';

export const getSingleModule = async ({ id }) => {
  return axios.get(`/customer/module/${id}/`);
};
