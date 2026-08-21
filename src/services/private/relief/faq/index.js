import axios from '@/lib/axios';

export const getReliefFAQsList = async () => {
  return axios.get('/relief/faqs/');
};

export const getSingleReliefFAQ = async ({ id }) => {
  return axios.get(`/relief/faqs/${id}/`);
};

export const addReliefFAQ = async ({ payload }) => {
  return axios.post('/relief/faqs/', payload);
};

export const updateReliefFAQ = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/relief/faqs/${id}/`, payload);
};

export const deleteReliefFAQ = async ({ id }) => {
  return axios.delete(`/relief/faqs/${id}/`);
};

export const getReliefFAQCategoryOptions = async () => {
  return axios.get('/relief/faqs/categories/');
};

export const exportReliefFAQs = async (params = {}) => {
  return axios.get('/relief/faqs/export/', { params, responseType: 'blob' });
};

export const importReliefFAQs = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post('/relief/faqs/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
