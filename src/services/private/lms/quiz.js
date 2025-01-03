import axios from '@/lib/axios';

export const getQuizesList = async () => {
  return axios.get('/LMS/quiz/');
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
