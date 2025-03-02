import axios from '@/lib/axios';

export const getUsersList = async () => {
  return axios.get('/auth/users/list/');
};
