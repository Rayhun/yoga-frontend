import axios from '@/lib/axios';

export const createNewCommissionType = async ({ payload }) => {
  return axios.post('/commission/type/', payload);
};

export const getCommisionTypesList = async () => {
  return axios.get(`/commission/type`);
};

export const getCommissionTypeDetails = async ({ id }) => {
  return axios.get(`/commission/type/${id}/`);
};

export const updateCommissionType = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/commission/type/${id}/`, payload);
};
