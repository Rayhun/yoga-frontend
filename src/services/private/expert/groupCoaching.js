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

const EVENT_TAG_ID_FIELDS = ['culture_experience', 'categories', 'tags', 'languages'];

export const createNewGroupCoaching = async ({ payload }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    if (EVENT_TAG_ID_FIELDS.includes(key)) {
      if (Array.isArray(value) && value.length > 0) {
        formData.set(key, value.join(','));
      }
      return;
    }
    if (key === 'recurring_dates') {
      formData.set(key, JSON.stringify(value));
    } else {
      formData.set(key, value);
    }
  });

  return axios.post('/LMS/events/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateGroupCoaching = async ({ payload, id }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    if (EVENT_TAG_ID_FIELDS.includes(key)) {
      if (Array.isArray(value) && value.length > 0) {
        formData.set(key, value.join(','));
      }
      return;
    }
    if (key === 'recurring_dates') {
      formData.set(key, JSON.stringify(value));
    } else {
      formData.set(key, value);
    }
  });

  return axios.patch(`/LMS/events/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const duplicateGroupCoaching = async ({ id }) => {
  return axios.post(`/LMS/events/${id}/duplicate/`);
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
