import axios from '@/lib/axios';

export const getSubscriptionPagesList = async () => {
  return axios.get('/subscription/page/');
};

export const getSingleSubscriptionPage = async ({ id }) => {
  return axios.get(`/subscription/page/${id}/`);
};

export const addNewSubscriptionPage = async ({ payload }) => {
  return axios.post('/subscription/page/', payload);
};

export const updateExistingSubscriptionPage = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/subscription/page/${id}/`, payload);
};

export const deleteSingleSubscriptionPage = async ({ id }) => {
  return axios.delete(`/subscription/page/${id}/`);
};
