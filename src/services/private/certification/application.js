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

export const uploadCertificationFile = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/certification/file/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
