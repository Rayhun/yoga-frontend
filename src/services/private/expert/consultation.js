import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const createNewConsultation = async ({ payload: { categories, tags, ...payload } }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.set(key, value);
  });
  formData.set('categories', categories.join(','));
  formData.set('tags', tags.join(','));

  return axios.post('/LMS/consultations/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateExistingConsultation = async ({ payload: { categories, tags, ...payload }, id }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.set(key, value);
  });
  formData.set('categories', categories.join(','));
  formData.set('tags', tags.join(','));

  return axios.patch(`/LMS/consultations/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getExpertConsultationsList = async params => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/LMS/consultations?${searchParams}`);
};

export const getExpertConsultationDetails = async ({ id }) => {
  return axios.get(`/LMS/consultations/${id}`);
};

export const cancelConsultation = async ({ id }) => {
  return axios.post(`/consultation/${id}/status/`, { event_status: 'cancelled' });
};

export const completeConsultation = async ({ id, ...payload }) => {
  return axios.post(`/consultation/${id}/status/`, { event_status: 'completed', ...payload });
};

export const getExpertPersonalConsultation = async () => {
  return axios.get(`/expert/consultation/enroll/`);
};