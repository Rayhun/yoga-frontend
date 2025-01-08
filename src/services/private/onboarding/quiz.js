import axios from '@/lib/axios';

export const getQuizesList = async () => {
  return axios.get('/onboarding/quiz/');
};

export const getSingleQuiz = async ({ id }) => {
  return axios.get(`/onboarding/quiz/${id}/`);
};

export const addNewQuiz = async ({ payload }) => {
  return axios.post('/onboarding/quiz/', payload);
};

export const updateExistingQuiz = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/onboarding/quiz/${id}/`, payload);
};

export const deleteSingleQuiz = async ({ id }) => {
  return axios.delete(`/onboarding/quiz/${id}/`);
};

export const submitQuiz = async ({ payload }) => {
  return axios.post('/onboarding/submit-answers/', payload);
};

export const importQuizes = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/onboarding/quiz/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
