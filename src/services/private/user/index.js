import axios from '@/lib/axios';

export const getUsersList = async () => {
  return axios.get('/auth/users/list/');
};

export const updateUser = async data => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'available' || value) formData.set(key, value);
  });
  return axios.patch(`/auth/update/user`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
