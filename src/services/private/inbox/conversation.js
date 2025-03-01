import axios from '@/lib/axios';

export const getMyConversations = async () => {
  return axios.get('/chat/conversations');
};

export const getMyConversationMessages = async ({ id }) => {
  return axios.get(`/chat/conversations/${id}/messages`);
};
