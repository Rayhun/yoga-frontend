import axios from '@/lib/axios';

export const getExpertPaymentsList = async (params = {}) => {
  return axios.get('/LMS/user-expert-payment/', { params });
};

export const getSingleExpertPayment = async ({ id }) => {
  return axios.get(`/LMS/user-expert-payment/${id}/`);
};

export const updatePaymentStatus = async ({ id, payment_status }) => {
  return axios.post(`/LMS/user-expert-payment/${id}/update_status/`, { payment_status });
};
