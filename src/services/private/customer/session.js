import axios from '@/lib/axios';

export const getSingleSession = async ({ id }) => {
  return axios.get(`/customer/session/${id}/`);
};
