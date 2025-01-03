import axios from '@/lib/axios';

export const getImageSessionsList = async () => {
  return axios.get('/LMS/session/');
};

export const getSingleImageSession = async ({ id }) => {
  return axios.get(`/LMS/session/${id}/`);
};

export const addNewImageSession = async ({ payload: { categories, tags, ...payload } }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.set(key, value);
  });
  formData.set('categories', categories.join(','));
  formData.set('tags', tags.join(','));

  return axios.post('/LMS/session/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateExistingImageSession = async ({ payload: { id, categories, tags, ...payload } }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.set(key, value);
  });
  formData.set('categories', categories.join(','));
  formData.set('tags', tags.join(','));

  return axios.put(`/LMS/session/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteSingleImageSession = async ({ id }) => {
  return axios.delete(`/LMS/session/${id}/`);
};
