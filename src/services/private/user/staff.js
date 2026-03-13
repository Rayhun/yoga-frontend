import axios from '@/lib/axios';

// Staff Users CRUD operations
export const getStaffUsersList = async () => {
  return axios.get('/auth/staff/');
};

export const getStaffUser = async ({ id }) => {
  return axios.get(`/auth/staff/${id}/`);
};

export const createStaffUser = async ({ payload }) => {
  return axios.post('/auth/staff/', payload);
};

export const updateStaffUser = async ({ id, payload }) => {
  return axios.patch(`/auth/staff/${id}/`, payload);
};

export const deleteStaffUser = async ({ id }) => {
  return axios.delete(`/auth/staff/${id}/`);
};
