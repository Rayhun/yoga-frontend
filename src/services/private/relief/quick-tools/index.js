import axios from '@/lib/axios';

export const getReliefQuickToolsList = async () => {
  return axios.get('/relief/quick-tools/');
};

export const getSingleReliefQuickTool = async ({ id }) => {
  return axios.get(`/relief/quick-tools/${id}/`);
};

export const addReliefQuickTool = async ({ payload }) => {
  return axios.post('/relief/quick-tools/', payload);
};

export const updateReliefQuickTool = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/relief/quick-tools/${id}/`, payload);
};

export const deleteReliefQuickTool = async ({ id }) => {
  return axios.delete(`/relief/quick-tools/${id}/`);
};

export const exportReliefQuickTools = async (params = {}) => {
  return axios.get('/relief/quick-tools/export/', { params, responseType: 'blob' });
};

export const importReliefQuickTools = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post('/relief/quick-tools/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
