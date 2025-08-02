import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getPayoutList = async (params) => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/commissions?${searchParams}`);
};

export const exportPayoutList = async () => {
  return axios.get(`/commissions/export/`);
};

export const updatePayoutStatus = async ({ payload }) => {
  return axios.post(`/commissions/update-status/`, payload);
};
