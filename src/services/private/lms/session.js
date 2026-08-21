import axios from '@/lib/axios';

const appendSessionPayload = (formData, payload) => {
  const { thumbnail, audio_file, file, ...rest } = payload;

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.set(key, value);
    }
  });

  if (file) formData.set('file', file);
  if (audio_file) formData.set('audio_file', audio_file);
  if (thumbnail) formData.set('thumbnail_image', thumbnail);
};

export const getSessionsList = async ({ type }) => {
  return axios.get(`/LMS/session/list/?type=${type}`);
};

export const getSingleSession = async ({ id }) => {
  return axios.get(`/LMS/session/${id}/`);
};

export const addNewSession = async ({
  payload: { focus_areas, equipments, languages, categories, culture_experience, ...payload },
}) => {
  const formData = new FormData();
  appendSessionPayload(formData, payload);
  formData.set('focus_areas', focus_areas.join(','));
  formData.set('equipments', equipments.join(','));
  formData.set('languages', languages.join(','));
  formData.set('categories', categories.join(','));
  formData.set('culture_experience', culture_experience.join(','));

  return axios.post('/LMS/session/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const updateExistingSession = async ({
  payload: { id, focus_areas, equipments, languages, categories, culture_experience, ...payload },
}) => {
  const formData = new FormData();
  appendSessionPayload(formData, payload);
  if (categories) formData.set('categories', categories.join(','));
  if (culture_experience) formData.set('culture_experience', culture_experience.join(','));
  if (focus_areas) formData.set('focus_areas', focus_areas.join(','));
  if (equipments) formData.set('equipments', equipments.join(','));
  if (languages) formData.set('languages', languages.join(','));

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

export const exportSessions = async (params = {}) => {
  return axios.get('/LMS/session/export/', { params, responseType: 'blob' });
};
