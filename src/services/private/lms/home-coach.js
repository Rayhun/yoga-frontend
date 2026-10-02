import axios from '@/lib/axios';

export const getHomeCoachConfigsList = async (params = {}) => {
  return axios.get('/LMS/home-coach/', { params });
};

export const getSingleHomeCoachConfig = async ({ id }) => {
  return axios.get(`/LMS/home-coach/${id}/`);
};

export const createHomeCoachConfig = async (payload) => {
  return axios.post('/LMS/home-coach/', payload);
};

export const updateHomeCoachConfig = async ({ id, ...restPayload }) => {
  return axios.put(`/LMS/home-coach/${id}/`, restPayload);
};

export const deleteHomeCoachConfig = async ({ id }) => {
  return axios.delete(`/LMS/home-coach/${id}/`);
};
