import axios from '@/lib/axios';

export const getPublicExpertProfile = async ({ username }) => {
  return axios.get(`/LMS/expert/${username}/details/`);
};


export const getPublicConsultations = async ({ id }) => {
  return axios.get(`/consultation/${id}/public`);
};

export const getPublicConsultationDetail = async ({ id }) => {
  return axios.get(`/consultation/${id}/public/detail/`);
};


export const getPublicGroupCoaching = async ({ id }) => {
  return axios.get(`/event/${id}/public/`);
};

export const getPublicGroupCoachingDetail = async ({ id }) => {
  return axios.get(`/event/${id}/public/detail/`);
};


export const getPublicPrograms = async ({ id }) => {
  return axios.get(`/program/${id}/public/`);
};

export const getPublicProgramDetail = async ({ id }) => {
  return axios.get(`/program/${id}/public/detail/`);
};

export const createGuestCheckoutSession = async ({ type, object_id }) => {
  return axios.post('/subscription/guest-checkout/', { type, object_id });
};
