import axios from '@/lib/axios';

export const uploadLMSFile = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/LMS/file/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
