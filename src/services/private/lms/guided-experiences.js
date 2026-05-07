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

export const createGuidedExperience = async ({ payload: { categories, tags, ...payload } }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (key === 'recurring_dates') {
        formData.set(key, JSON.stringify(value));
      } else {
        formData.set(key, value);
      }
    }
  });
  if (categories && categories.length > 0) {
    formData.set('categories', categories.join(','));
  }
  if (tags && tags.length > 0) {
    formData.set('tags', tags.join(','));
  }

  return axios.post('/LMS/events/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateGuidedExperience = async ({ payload: { categories, tags, ...payload }, id }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (key === 'recurring_dates') {
        formData.set(key, JSON.stringify(value));
      } else {
        formData.set(key, value);
      }
    }
  });
  if (categories && categories.length > 0) {
    formData.set('categories', categories.join(','));
  }
  if (tags && tags.length > 0) {
    formData.set('tags', tags.join(','));
  }

  return axios.patch(`/LMS/events/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

