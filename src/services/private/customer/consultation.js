import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getCustomerConsultationsList = async params => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/customer/consultation/?${searchParams}`);
};

export const getConsultationDetails = async ({ id }) => {
  return axios.get(`/customer/consultation/${id}`);
};

export const buyConsultation = async ({ id }) => {
  return axios.post(`/consultation/checkout/`, { consultation: id });
};

export const enrollConsultation = async ({ id }) => {
  return axios.post(`/customer/consultation/${id}/enroll/`);
};