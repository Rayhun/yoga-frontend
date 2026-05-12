import axios from '@/lib/axios';
import { API_V2_BASE_URL } from '@/utils/config';

/** LMS legacy tags (LMS.Tag) for programs, modules, sessions — `id` + `name`. */
export const getLmsContentTagsList = async () => {
  return axios.get('/LMS/tag/list/');
};

export const getTagsList = async ({
  limit = 50,
  offset = 0,
  namespace = '',
  canonical_tag = '',
  status = '',
  search = '',
} = {}) => {
  return axios.get(`${API_V2_BASE_URL}/tags/`, {
    params: { limit, offset, namespace, canonical_tag, status, search },
  });
};

export const getSingleTag = async ({ id }) => {
  return axios.get(`${API_V2_BASE_URL}/tags/${id}/`);
};

export const addNewTag = async ({ payload }) => {
  return axios.post(`${API_V2_BASE_URL}/tags/`, payload);
};

export const updateExistingTag = async ({ payload: { id, ...payload } }) => {
  return axios.patch(`${API_V2_BASE_URL}/tags/${id}/`, payload);
};

export const deleteSingleTag = async ({ id }) => {
  return axios.delete(`${API_V2_BASE_URL}/tags/${id}/`);
};

export const importTags = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post(`${API_V2_BASE_URL}/tag/import-data/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const exportTags = async () => {
  return axios.get(`${API_V2_BASE_URL}/tag/export-data/`, {
    responseType: 'blob',
  });
};
