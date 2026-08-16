import axios from '@/lib/axios';

export const getCertificationDashboard = async () => {
  return axios.get('/certification/dashboard/');
};

export const getProgramContent = async ({ id }) => {
  return axios.get(`/certification/programs/${id}/content/`);
};

export const completeLesson = async ({ id, payload }) => {
  return axios.post(`/certification/lessons/${id}/complete/`, payload);
};
