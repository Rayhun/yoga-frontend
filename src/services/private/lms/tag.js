import axios from '@/lib/axios';

export const getTagsList = async () => {
  return axios.get('/LMS/tag/');
};

export const getSingleTag = async ({ id }) => {
  return axios.get(`/LMS/tag/${id}/`);
};

export const addNewTag = async ({ payload }) => {
  return axios.post('/LMS/tag/', payload);
};

export const updateExistingTag = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/LMS/tag/${id}/`, payload);
};

export const deleteSingleTag = async ({ id }) => {
  return axios.delete(`/LMS/tag/${id}/`);
};

export const importTags = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/LMS/tag/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
