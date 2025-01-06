import axios from '@/lib/axios';
import { getQuizesList } from './quiz';
import { getSessionsList } from './session';
import { MODULE_TYPE } from '@/utils/enums';

export const getModulesList = async () => {
  return axios.get('/LMS/module/');
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

export const getModuleContentOptions = async ({ type }) => {
  if (type === MODULE_TYPE.quiz) return getQuizesList();
  return getSessionsList({ type });
};
