import axios from '@/lib/axios';

export const registerNewAffiliateUser = async ({ payload }) => {
    return axios.post('/auth/affiliate/register/', payload);
};

export const getAffiliatesUsersList = async () => {
  return axios.get(`/affiliate/user`);
};

export const getAffiliateUserDetails = async ({ id }) => {
  return axios.get(`/affiliate/user/${id}/`);
};

export const approveAffiliateUser = async ({ payload: { id, ...payload } }) => {
  return axios.post(`/affiliate-approval/${id}/`, payload);
};

export const importAffiliateUsers = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/affiliate/user/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const exportAffiliateUsers = async () => {
  return axios.get('/affiliate/user/export/', {
    responseType: 'blob',
  });
};
