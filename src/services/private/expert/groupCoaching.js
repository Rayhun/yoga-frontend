import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getExpertGroupCoachingList = async params => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/LMS/events?${searchParams}`);
};

export const getExpertGroupCoachingDetails = async ({ id }) => {
  return axios.get(`/LMS/events/${id}`);
};

export const createNewGroupCoaching = async ({ payload: { categories, tags, ...payload } }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.set(key, value);
  });
  formData.set('categories', categories.join(','));
  formData.set('tags', tags.join(','));

  return axios.post('/LMS/events/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
