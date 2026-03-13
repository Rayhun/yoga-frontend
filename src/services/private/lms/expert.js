import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getExpertsList = async (params) => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/LMS/experts/?${searchParams}`);
};

export const getSingleExpert = async ({ id }) => {
  return axios.get(`/LMS/experts/${id}/`);
};

export const addNewExpert = async ({ payload: { categories, tags, ...payload } }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.set(key, value);
  });
  if (categories && categories.length > 0) {
    formData.set('categories', categories.join(','));
  }
  if (tags && tags.length > 0) {
    formData.set('tags', tags.join(','));
  }

  return axios.post('/LMS/experts/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateExistingExpert = async ({ payload: { id, categories, tags, ...payload } }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key==='available' || value) formData.set(key, value);
  });
  if (categories && categories.length > 0) {
    formData.set('categories', categories.join(','));
  }
  if (tags && tags.length > 0) {
    formData.set('tags', tags.join(','));
  }

  return axios.put(`/LMS/experts/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteSingleExpert = async ({ id }) => {
  return axios.delete(`/LMS/experts/${id}/`);
};

export const importExperts = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/LMS/experts/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const toggleExpertStatus = async ({ id }) => {
  return axios.post(`/LMS/experts/${id}/toggle_active/`);
};

export const exportExpertsList = async (params) => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/LMS/experts/export/?${searchParams}`,);
};

export const getLookupsListByCategory = async (category) => {
  return axios.get(`/LMS/lookup/?category=${category}`);
};