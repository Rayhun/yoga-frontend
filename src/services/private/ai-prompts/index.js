import axios from '@/lib/axios';

export const createAIChatPromptType = async ({ payload, config = {} }) => {
  return axios.post('/ai/prompts/', payload, config);
};

export const updateAIChatPrompt = async ({ payload, config = {} }) => {
  // Handle both FormData and regular object payloads
  if (payload instanceof FormData) {
    // For FormData, extract id and send the rest
    const id = payload.get('id');
    payload.delete('id'); // Remove id from FormData since it's in the URL
    return axios.put(`/ai/prompts/${id}/`, payload, config);
  } else {
    // For regular objects, destructure as before
    const { id, ...restPayload } = payload;
    return axios.put(`/ai/prompts/${id}/`, restPayload, config);
  }
};

export const getAIPromptsList = async () => {
  return axios.get(`/ai/prompts/`);
};

export const getAIChatPromptDetails = async ({ id }) => {
  return axios.get(`/ai/prompts/${id}/`);
};

export const toggleAIChatPromptStatus = async ({ id }) => {
  return axios.post(`/ai/prompts/${id}/toggle_active/`);
};

export const getTrackers = async (insight) => {
  const params = insight ? { insight } : {};
  return axios.get('/goal-tracking/tracker/', { params });
};

export const getScheduleOptions = async () => {
  return axios.get('/ai/prompts/schedule-options/');
};
