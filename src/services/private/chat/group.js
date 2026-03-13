import axios from '@/lib/axios';

export const getGroupsList = async () => {
  return axios.get('/chat/group/conversations/');
};

export const getSingleGroup = async ({ id }) => {
  return axios.get(`/chat/group/conversations/${id}/`);
};

export const addNewGroup = async ({ payload }) => {
  return axios.post('/chat/group/conversations/', payload);
};

export const updateExistingGroup = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/chat/group/conversations/${id}/`, payload);
};

export const deleteSingleGroup = async ({ id }) => {
  return axios.delete(`/chat/group/conversations/${id}/`);
};
