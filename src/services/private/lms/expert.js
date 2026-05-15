import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getExpertsList = async (params = {}) => {
  const searchParams = getSearchParamsFromObject(params);
  const qs = searchParams.toString();
  return axios.get(qs ? `/LMS/experts/?${qs}` : '/LMS/experts/');
};

/** Parse paginated experts list from GET /LMS/experts/ (envelope: data.results). */
export const getExpertsListRows = response => {
  const payload = response?.data?.data;
  if (Array.isArray(payload)) return payload;
  if (payload?.results && Array.isArray(payload.results)) return payload.results;
  return [];
};

export const getExpertsListCount = response => {
  const payload = response?.data?.data;
  if (payload && typeof payload.count === 'number') return payload.count;
  return 0;
};

// Optional `context` (expert_profile | guided_experience | program | module | session | quiz) selects namespaces on the API.
export const getExpertCatalogTagsList = async (params = {}) => {
  const { context = 'expert_profile', ...rest } = params;
  const searchParams = getSearchParamsFromObject({ context, ...rest });
  const qs = searchParams.toString();
  return axios.get(qs ? `/LMS/experts/catalog-tags/?${qs}` : '/LMS/experts/catalog-tags/');
};

/** Rows from GET /LMS/experts/catalog-tags/ */
export const getExpertCatalogTagsRows = response => {
  const payload = response?.data?.data;
  if (payload?.results && Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload)) return payload;
  return [];
};

export const getSingleExpert = async ({ id }) => {
  return axios.get(`/LMS/experts/${id}/`);
};

export const addNewExpert = async ({ payload: { categories, tags, ...payload } }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.set(key, value);
  });
  if (categories && categories.length > 0) {
    formData.set('categories', categories.join(','));
  }
  if (tags && tags.length > 0) {
    formData.set('tags', tags.join(','));
  }

  return axios.post('/LMS/experts/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateExistingExpert = async ({ payload: { id, categories, tags, ...payload } }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key==='available' || value) formData.set(key, value);
  });
  if (categories && categories.length > 0) {
    formData.set('categories', categories.join(','));
  }
  if (tags && tags.length > 0) {
    formData.set('tags', tags.join(','));
  }

  return axios.put(`/LMS/experts/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteSingleExpert = async ({ id }) => {
  return axios.delete(`/LMS/experts/${id}/`);
};

export const importExperts = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/LMS/experts/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const toggleExpertStatus = async ({ id }) => {
  return axios.post(`/LMS/experts/${id}/toggle_active/`);
};

export const exportExpertsList = async (params) => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/LMS/experts/export/?${searchParams}`, {
    responseType: 'blob',
  });
};

export const getLookupsListByCategory = async (category) => {
  return axios.get(`/LMS/lookup/?category=${category}`);
};