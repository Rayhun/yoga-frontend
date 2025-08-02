import axios from '@/lib/axios';

export const getMyConversations = async () => {
  return axios.get('/chat/conversations');
};

export const getMyConversationMessages = async ({ id }) => {
  return axios.get(`/chat/conversations/${id}/messages`);
};

export const getPreSignedUrl = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post('/LMS/file/upload/ ', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
