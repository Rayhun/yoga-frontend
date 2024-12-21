import axios from '@/lib/axios';

export const authenticateUser = async () => {
  return axios.get('/auth/user');
};

export const loginUser = async ({ payload }) => {
  return axios.post('/auth/login/', payload);
};

export const registerNewUser = async ({ payload }) => {
  return axios.post('/auth/register/', payload);
};

export const forgotPassword = async ({ payload }) => {
  return axios.post('/auth/forgotpassword/', payload);
};
