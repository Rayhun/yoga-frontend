import axios from '@/lib/axios';
import { getModulesList } from './module';
import { getQuizesList } from './quiz';
import { getSessionsList } from './session';
import { PROGRAM_TYPE } from '@/utils/enums';

export const getProgramsList = async () => {
  return axios.get('/LMS/program/');
};

export const getSingleProgram = async ({ id }) => {
  return axios.get(`/LMS/program/${id}/`);
};

export const addNewProgram = async ({ payload }) => {
  return axios.post('/LMS/program/', payload);
};

export const updateExistingProgram = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/LMS/program/${id}/`, payload);
};

export const deleteSingleProgram = async ({ id }) => {
  return axios.delete(`/LMS/program/${id}/`);
};

export const getProgramContentOptions = async ({ type }) => {
  if (type === PROGRAM_TYPE.module) return getModulesList();
  if (type === PROGRAM_TYPE.quiz) return getQuizesList();
  return getSessionsList({ type });
};
