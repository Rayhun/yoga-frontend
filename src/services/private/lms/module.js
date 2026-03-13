import axios from '@/lib/axios';
import { getQuizesList } from './quiz';
import { getSessionsList } from './session';
import { MODULE_TYPE } from '@/utils/enums';

export const getModulesList = async () => {
  return axios.get('/LMS/module/list/');
};

export const getSingleModule = async ({ id }) => {
  return axios.get(`/LMS/module/${id}/`);
};

export const addNewModule = async ({ payload }) => {
  return axios.post('/LMS/module/', payload);
};

export const updateExistingModule = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/LMS/module/${id}/`, payload);
};

export const deleteSingleModule = async ({ id }) => {
  return axios.delete(`/LMS/module/${id}/`);
};

export const deleteModuleContent = async ({ id }) => {
  return axios.delete(`/LMS/module/content/${id}/delete/`);
};

export const getModuleContentOptions = async ({ type }) => {
  if (type === MODULE_TYPE.quiz) return getQuizesList();
  return getSessionsList({ type });
};

export const importModules = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/LMS/module/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const importModuleContents = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/LMS/module/content/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const exportModules = async () => {
  return axios.get('/LMS/module/export/', { responseType: 'blob' });
};

export const exportModuleContent = async () => {
  return axios.get('/LMS/module/content/export/', { responseType: 'blob' });
};
