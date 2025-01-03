import axios from '@/lib/axios';

export const getSessionsList = async ({ type }) => {
  return axios.get(`/LMS/session/?content_type=${type}`);
};

export const getSingleSession = async ({ id }) => {
  return axios.get(`/LMS/session/${id}/`);
};

export const addNewSession = async ({ payload: { categories, tags, ...payload } }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.set(key, value);
  });
  formData.set('categories', categories.join(','));
  formData.set('tags', tags.join(','));

  return axios.post('/LMS/session/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateExistingSession = async ({ payload: { id, categories, tags, ...payload } }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.set(key, value);
  });
  formData.set('categories', categories.join(','));
  formData.set('tags', tags.join(','));

  return axios.put(`/LMS/session/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteSingleSession = async ({ id }) => {
  return axios.delete(`/LMS/session/${id}/`);
};
