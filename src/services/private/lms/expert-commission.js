import axios from '@/lib/axios';

export const getExpertCommissionsList = async (params = {}) => {
  return axios.get('/LMS/expert-commission/', { params });
};

export const getSingleExpertCommission = async ({ id }) => {
  return axios.get(`/LMS/expert-commission/${id}/`);
};

export const createExpertCommission = async (payload) => {
  return axios.post('/LMS/expert-commission/', payload);
};

export const updateExpertCommission = async ({ id, ...restPayload }) => {
  return axios.put(`/LMS/expert-commission/${id}/`, restPayload);
};

export const deleteExpertCommission = async ({ id }) => {
  return axios.delete(`/LMS/expert-commission/${id}/`);
};

export const toggleExpertCommissionStatus = async ({ id }) => {
  return axios.post(`/LMS/expert-commission/${id}/toggle_active/`);
};
