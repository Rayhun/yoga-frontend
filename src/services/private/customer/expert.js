import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getCustomerExpertsList = async (params) => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/customer/experts/?${searchParams}`);
};

export const getCustomerExpertDetails = async ({ id }) => {
  return axios.get(`/LMS/experts/${id}/`);
};
