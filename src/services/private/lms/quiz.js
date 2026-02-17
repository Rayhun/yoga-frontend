import axios from '@/lib/axios';

export const getQuizesList = async () => {
  return axios.get('/LMS/quiz/list/');
};

export const getSingleQuiz = async ({ id }) => {
  return axios.get(`/LMS/quiz/${id}/`);
};

export const addNewQuiz = async ({ payload }) => {
  return axios.post('/LMS/quiz/', payload);
};

export const updateExistingQuiz = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/LMS/quiz/${id}/`, payload);
};

export const deleteSingleQuiz = async ({ id }) => {
  return axios.delete(`/LMS/quiz/${id}/`);
};

export const importQuizes = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/LMS/quiz/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const exportQuizes = async () => {
  return axios.get('/LMS/quiz/export/', { responseType: 'blob' });
};
