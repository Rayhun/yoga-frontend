import axios from '@/lib/axios';

export const getMyConversations = async () => {
  return axios.get('/chat/conversations');
};

export const getMyConversationMessages = async ({ id }) => {
  return axios.get(`/chat/conversations/${id}/messages`);
};

export const getAvailableCoaches = async (params = {}) => {
  return axios.get('/chat/coaches', { params });
};

export const createCoachConversation = async (coachUserId) => {
  return axios.post('/chat/coaches/conversation/', { coach_user_id: coachUserId });
};

export const getPreSignedUrl = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post('/LMS/file/upload/ ', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
