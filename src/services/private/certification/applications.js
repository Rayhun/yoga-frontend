import axios from '@/lib/axios';

export const getApplicationsList = async ({ type, status }) => {
  return axios.get('/certification/admin/applications/', { params: { type, status } });
};

export const approveApplication = async ({ type, id }) => {
  return axios.post(`/certification/admin/applications/${type}/${id}/approve/`);
};

export const rejectApplication = async ({ type, id, payload }) => {
  return axios.post(`/certification/admin/applications/${type}/${id}/reject/`, payload);
};
