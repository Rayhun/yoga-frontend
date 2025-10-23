import axios from '@/lib/axios';

// Business Subscription Management API calls

export const getBusinessSubscription = async () => {
  return axios.get('/auth/business-subscription/');
};

export const updateBusinessSubscription = async (data) => {
  return axios.put('/auth/business-subscription/', data);
};

export const getBusinessSubscriptionHistory = async () => {
  return axios.get('/auth/business-subscription/history/');
};
