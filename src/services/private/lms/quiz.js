import axios from '@/lib/axios';

export const getQuizesList = async () => {
  return axios.get('/LMS/quiz/');
};

export const getSingleQuiz = async ({ id }) => {
  return axios.get(`/LMS/quiz/${id}/`);
};

export const addNewQuiz = async ({ payload: { categories, tags, ...payload } }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.set(key, value);
  });
  formData.set('categories', categories.join(','));
  formData.set('tags', tags.join(','));

  return axios.post('/LMS/quiz/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateExistingQuiz = async ({ payload: { id, categories, tags, ...payload } }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.set(key, value);
  });
  formData.set('categories', categories.join(','));
  formData.set('tags', tags.join(','));

  return axios.put(`/LMS/quiz/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteSingleQuiz = async ({ id }) => {
  return axios.delete(`/LMS/quiz/${id}/`);
};
