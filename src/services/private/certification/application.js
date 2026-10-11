import axios from '@/lib/axios';

export const applyAsInstitution = async ({ payload }) => {
  return axios.post('/certification/apply/institution/', payload);
};

export const getMyInstitutionApplication = async () => {
  return axios.get('/certification/apply/institution/me/');
};

export const applyForQTE = async ({ payload }) => {
  return axios.patch('/certification/apply/expert-qte/', payload);
};

export const getMyQTEApplication = async () => {
  return axios.get('/certification/apply/expert-qte/me/');
};

// `kind` ('audio' | 'image' | ...) is optional: the server then checks the file against that kind alone, with
// its size limit (image 5 MB, audio 50 MB). The response carries `file_key` (store this) and `file_link`.
export const uploadCertificationFile = async ({ file, kind, onUploadProgress }) => {
  const formData = new FormData();
  formData.append('file', file);
  if (kind) formData.append('kind', kind);

  return axios.post('/certification/file/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...(onUploadProgress ? { onUploadProgress } : {}),
  });
};
