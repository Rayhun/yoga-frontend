import apiClient from '@/utils/api-service';

export const getAllAvatars = async () => {
  return apiClient.get('/avatars');
};

export const getSingleAvatar = async id => {
  return apiClient.get(`/avatars/${id}`);
};

export const addNewAvatar = async payload => {
  const formData = new FormData();

  formData.append('image', payload.image);

  return apiClient.post('/avatars', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateExistingAvatar = async ({ id, ...payload }) => {
  const formData = new FormData();

  formData.append('image', payload.image);

  return apiClient.patch(`/avatars/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteExistingAvatar = async id => {
  return apiClient.delete(`/avatars/${id}`);
};
