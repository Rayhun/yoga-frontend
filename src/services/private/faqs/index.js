import axios from '@/lib/axios';

export const getFrequentlyAskedQuestionsList = async () => {
  return axios.get('/LMS/faqs/');
};

export const getSingleQuestion = async ({ id }) => {
  return axios.get(`/LMS/faqs/${id}/`);
};

export const addNewQuestion = async ({ payload }) => {
  return axios.post('/LMS/faqs/', payload);
};

export const updateExistingQuestion = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/LMS/faqs/${id}/`, payload);
};

export const deleteSingleQuestion = async ({ id }) => {
  return axios.delete(`/LMS/faqs/${id}/`);
};

export const getPublicFrequentlyAskedQuestion = async () => {
  return axios.get(`/faqs`);
};
