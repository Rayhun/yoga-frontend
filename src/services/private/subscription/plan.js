import axios from '@/lib/axios';

export const getSubscriptionPlansList = async () => {
  return axios.get('/subscription/plan/');
};

export const getSingleSubscriptionPlan = async ({ id }) => {
  return axios.get(`/subscription/plan/${id}/`);
};

export const addNewSubscriptionPlan = async ({ payload }) => {
  return axios.post('/subscription/plan/', payload);
};

export const updateExistingSubscriptionPlan = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/subscription/plan/${id}/`, payload);
};

export const deleteSingleSubscriptionPlan = async ({ id }) => {
  return axios.delete(`/subscription/plan/${id}/`);
};

export const createCheckoutSessionForSubscriptionPlan = async ({ id }) => {
  return axios.post(`/subscription/plan/${id}/checkout/`);
};
