import axios from '@/lib/axios';

// Customer Subscription Management API calls

export const getCustomerSubscriptionStatus = async () => {
  return axios.get('/subscription/status/');
};

export const getCustomerSubscriptionHistory = async () => {
  return axios.get('/subscription/history/');
};

export const cancelCustomerSubscription = async () => {
  return axios.post('/subscription/cancel/');
};

export const reactivateCustomerSubscription = async () => {
  return axios.post('/subscription/reactivate/');
};

