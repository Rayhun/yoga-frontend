import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getExpertProgramsList = async () => {
  // const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/expert/programs`);
};

export const uploadPrograms = async ({ payload }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key==='available' || value) formData.set(key, value);

  });
  // return axios.post(`LMS/experts/upload/programs/`, payload);
  return axios.post(`LMS/experts/upload/programs/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const savePaymentInfo = async ({ payload }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key==='available' || value) formData.set(key, value);

  });
  return axios.post(`LMS/experts/payment/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

