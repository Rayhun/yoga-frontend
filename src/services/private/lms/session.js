import axios from '@/lib/axios';

export const getSessionsList = async ({ type }) => {
  return axios.get(`/LMS/session/list/?type=${type}`);
};

export const getSingleSession = async ({ id }) => {
  return axios.get(`/LMS/session/${id}/`);
};

export const addNewSession = async ({
  payload: { focus_areas, equipments, languages, categories, tags, ...payload },
}) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.set(key, value);
  });
  formData.set('focus_areas', focus_areas.join(','));
  formData.set('equipments', equipments.join(','));
  formData.set('languages', languages.join(','));
  formData.set('categories', categories.join(','));
  formData.set('tags', tags.join(','));

  return axios.post('/LMS/session/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateExistingSession = async ({ payload: { id, categories, tags, ...payload } }) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) formData.set(key, value);
  });
  formData.set('categories', categories.join(','));
  formData.set('tags', tags.join(','));

  return axios.put(`/LMS/session/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteSingleSession = async ({ id }) => {
  return axios.delete(`/LMS/session/${id}/`);
};

export const importSessions = async ({ file, type }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post(`/LMS/session/${type.toLowerCase()}/import/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
