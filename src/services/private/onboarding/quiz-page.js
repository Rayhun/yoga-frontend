import axios from '@/lib/axios';
import { API_V2_BASE_URL } from '@/utils/config';

const PAGES_BASE = `${API_V2_BASE_URL}/onboarding/quiz/pages`;

export const getQuizPagesList = async () => {
  return axios.get(`${PAGES_BASE}/`);
};

export const getSingleQuizPage = async ({ id }) => {
  return axios.get(`${PAGES_BASE}/${id}/`);
};

export const addNewQuizPage = async ({ payload }) => {
  return axios.post(`${PAGES_BASE}/`, payload);
};

export const updateExistingQuizPage = async ({ payload: { id, ...payload } }) => {
  return axios.put(`${PAGES_BASE}/${id}/`, payload);
};

export const deleteSingleQuizPage = async ({ id }) => {
  return axios.delete(`${PAGES_BASE}/${id}/`);
};
