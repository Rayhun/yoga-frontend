import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getGuidedExperiencesList = async (params) => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/admin/guided-experiences/?${searchParams}`);
};

export const getSingleGuidedExperience = async ({ id }) => {
  return axios.get(`/LMS/events/${id}/`);
};

export const deleteGuidedExperience = async ({ id }) => {
  return axios.delete(`/LMS/events/${id}/`);
};

export const toggleGuidedExperienceStatus = async ({ id }) => {
  return axios.post(`/LMS/events/${id}/toggle_active/`);
};

export const duplicateGuidedExperience = async ({ id }) => {
  return axios.post(`/LMS/events/${id}/duplicate/`);
};

const EVENT_TAG_ID_FIELDS = ['culture_experience', 'categories', 'tags', 'languages'];

export const createGuidedExperience = async ({ payload }) => {
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

export const importGuidedExperiences = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/LMS/events/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const exportGuidedExperiencesList = async (params) => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/LMS/events/export/?${searchParams}`, {
    responseType: 'blob',
  });
};

export const updateGuidedExperience = async ({ payload, id }) => {
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

