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

// Granular curriculum endpoints (one module / lesson / quiz per request). Each answers
// `{ status, message, data }`; `data` carries the changed object plus the new order.
export const createModule = async ({ id, payload }) => {
  return axios.post(`/certification/programs/${id}/modules/`, payload);
};

export const updateModule = async ({ id, moduleId, payload }) => {
  return axios.patch(`/certification/programs/${id}/modules/${moduleId}/`, payload);
};

export const deleteModule = async ({ id, moduleId }) => {
  return axios.delete(`/certification/programs/${id}/modules/${moduleId}/`);
};

export const reorderModules = async ({ id, ids }) => {
  return axios.put(`/certification/programs/${id}/modules/order/`, { ids });
};

export const createLesson = async ({ id, moduleId, payload }) => {
  return axios.post(`/certification/programs/${id}/modules/${moduleId}/lessons/`, payload);
};

// `payload.module` (a module id of this program) moves the lesson to the end of that module.
export const updateLesson = async ({ id, lessonId, payload }) => {
  return axios.patch(`/certification/programs/${id}/lessons/${lessonId}/`, payload);
};

export const deleteLesson = async ({ id, lessonId }) => {
  return axios.delete(`/certification/programs/${id}/lessons/${lessonId}/`);
};

export const reorderLessons = async ({ id, moduleId, ids }) => {
  return axios.put(`/certification/programs/${id}/modules/${moduleId}/lessons/order/`, { ids });
};

export const saveLessonQuiz = async ({ id, lessonId, questions }) => {
  return axios.put(`/certification/programs/${id}/lessons/${lessonId}/questions/`, { questions });
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
