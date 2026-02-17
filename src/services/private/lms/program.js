import axios from '@/lib/axios';
import { getModulesList } from './module';
import { getQuizesList } from './quiz';
import { getSessionsList } from './session';
import { PROGRAM_TYPE } from '@/utils/enums';

export const getProgramsList = async () => {
  return axios.get('/LMS/progrm/list/');
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

export const deleteProgramContent = async ({ id }) => {
  return axios.delete(`/LMS/program/content/${id}/delete/`);
};

export const getProgramContentOptions = async ({ type }) => {
  if (type === PROGRAM_TYPE.module) return getModulesList();
  if (type === PROGRAM_TYPE.quiz) return getQuizesList();
  return getSessionsList({ type });
};

export const importPrograms = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/LMS/program/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const importProgramContents = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/LMS/program/content/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const exportProgramData = async () => {
  return axios.get('/LMS/program/export/', { responseType: 'blob' });
};

export const exportProgramContent = async () => {
  return axios.get('/LMS/program/content/export/', { responseType: 'blob' });
};
