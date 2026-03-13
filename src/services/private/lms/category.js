import axios from '@/lib/axios';

export const getCategoriesList = async () => {
  return axios.get('/LMS/category/');
};

export const getFeaturedCategoriesList = async () => {
  return axios.get('/LMS/feature/category/list/');
};

export const getSingleCategory = async ({ id }) => {
  return axios.get(`/LMS/category/${id}/`);
};

export const addNewCategory = async ({ payload }) => {
  return axios.post('/LMS/category/', payload);
};

export const updateExistingCategory = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/LMS/category/${id}/`, payload);
};

export const deleteSingleCategory = async ({ id }) => {
  return axios.delete(`/LMS/category/${id}/`);
};

export const importCategories = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/LMS/category/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const exportCategories = async () => {
  return axios.get('/LMS/category/export/', { responseType: 'blob' });
};
