import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getExpertGroupCoachingList = async (params = {}) => {
  // Filter out React Query internal properties before creating search params
  const cleanParams = { ...params };
  delete cleanParams.signal;
  delete cleanParams.queryKey;
  delete cleanParams.pageParam;
  
  const searchParams = getSearchParamsFromObject(cleanParams);
  // Always use trailing slash, only append query string if there are actual parameters
  const url = searchParams ? `/LMS/events/?${searchParams}` : `/LMS/events/`;
  return axios.get(url);
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

export const updateGroupCoaching = async ({ payload: { categories, tags, ...payload }, id }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.set(key, value);
  });
  formData.set('categories', categories.join(','));
  formData.set('tags', tags.join(','));

  return axios.patch(`/LMS/events/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const cancelGroupCoaching = async ({ id }) => {
  return axios.post(`/event/${id}/status/`, { event_status: 'cancelled', recording_link: '' });
};

export const completeGroupCoaching = async ({ id, recording_link }) => {
  return axios.post(`/event/${id}/status/`, { event_status: 'completed', recording_link });
};

export const checkZoomConnection = async ({ code }) => {
  return axios.post('/zoom/account/connected/', { zoom_code: code });
};
