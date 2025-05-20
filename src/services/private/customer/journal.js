import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getCustomerJournalList = async params => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/journal/?${searchParams}`);
};

export const createNewJournal = async ({ payload }) => {
  return axios.post('/journal/', payload);
};
