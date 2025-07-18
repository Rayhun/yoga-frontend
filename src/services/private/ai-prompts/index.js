import axios from '@/lib/axios';

export const createAIChatPromptType = async ({ payload }) => {
  return axios.post('/ai/prompts/', payload);
};

export const getAIPromptsList = async () => {
  return axios.get(`/ai/prompts/`);
};

export const getAIChatPromptDetails = async ({ id }) => {
  return axios.get(`/ai/prompts/${id}/`);
};

export const updateAIChatPrompt = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/ai/prompts/${id}/`, payload);
};

export const toggleAIChatPromptStatus = async ({ id }) => {
  return axios.post(`/ai/prompts/${id}/toggle_active/`);
};


