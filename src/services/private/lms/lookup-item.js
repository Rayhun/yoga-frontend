import axios from '@/lib/axios';

export const getLookupItemsList = async () => {
  return axios.get('/LMS/lookup-items/');
};

export const getSingleLookupItem = async ({ id }) => {
  return axios.get(`/LMS/lookup-items/${id}/`);
};

export const addNewLookupItem = async ({ payload }) => {
  return axios.post('/LMS/lookup-items/', payload);
};

export const updateExistingLookupItem = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/LMS/lookup-items/${id}/`, payload);
};

export const deleteSingleLookupItem = async ({ id }) => {
  return axios.delete(`/LMS/lookup-items/${id}/`);
};

