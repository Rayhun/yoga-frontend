import axios from '@/lib/axios';

export const getQuizesList = async () => {
  return axios.get('/onboarding/');
};

export const getSingleQuiz = async ({ id }) => {
  return axios.get(`/onboarding/${id}/`);
};

export const addNewQuiz = async ({ payload }) => {
  return axios.post('/onboarding/', payload);
};

export const updateExistingQuiz = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/onboarding/${id}/`, payload);
};

export const deleteSingleQuiz = async ({ id }) => {
  return axios.delete(`/onboarding/${id}/`);
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

export const getOnboardingRecommendations = async () => {
  return axios.get('/onboarding/recommendations/');
};
