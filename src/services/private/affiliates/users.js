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
