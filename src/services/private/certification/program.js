import axios from '@/lib/axios';

export const createProgram = async ({ payload }) => {
  return axios.post('/certification/programs/', payload);
};

export const getProgram = async ({ id }) => {
  return axios.get(`/certification/programs/${id}/`);
};

export const getMyPrograms = async () => {
  return axios.get('/certification/programs/mine/');
};

export const updateProgramBasics = async ({ id, payload }) => {
  return axios.patch(`/certification/programs/${id}/basics/`, payload);
};

export const updateProgramDelivery = async ({ id, payload }) => {
  return axios.patch(`/certification/programs/${id}/delivery/`, payload);
};

export const updateProgramModules = async ({ id, payload }) => {
  return axios.put(`/certification/programs/${id}/modules/`, payload);
};

export const updateProgramPricing = async ({ id, payload }) => {
  return axios.patch(`/certification/programs/${id}/pricing/`, payload);
};

export const updateProgramCertificateSetup = async ({ id, payload }) => {
  return axios.patch(`/certification/programs/${id}/certificate-setup/`, payload);
};

export const publishProgram = async ({ id, payload }) => {
  return axios.post(`/certification/programs/${id}/publish/`, payload);
};
