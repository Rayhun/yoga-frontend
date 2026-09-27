import Cookies from 'js-cookie';
import axios from '@/lib/axios';
import { API_BASE_URL } from '@/utils/config';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getCertificationCatalog = async params => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/certification/programs/catalog/?${searchParams}`);
};

export const getProgramCatalogDetail = async ({ id }) => {
  return axios.get(`/certification/programs/${id}/catalog-detail/`);
};

export const getEnrolledCertifications = async ({ status = '' }) => {
  return axios.get(`/certification/programs/enrolled/?status=${status}`);
};

export const getLearnerProgramDetail = async ({ id }) => {
  return axios.get(`/certification/programs/${id}/learner-detail/`);
};

export const getLearnerModuleDetail = async ({ programId, moduleId }) => {
  return axios.get(`/certification/programs/${programId}/modules/${moduleId}/detail/`);
};

export const getLearnerLessonDetail = async ({ programId, lessonId }) => {
  return axios.get(`/certification/programs/${programId}/lessons/${lessonId}/detail/`);
};

export const updateCertificationLessonProgress = async ({ programId, lessonId, watchPercent, positionSeconds }) => {
  return axios.post(`/certification/programs/${programId}/lessons/${lessonId}/progress/`, {
    watch_percent: watchPercent,
    position_seconds: positionSeconds,
  });
};

// Page-unload variant of updateCertificationLessonProgress: axios can't send `keepalive`
// requests, and sendBeacon can't set the Authorization header, so this is a plain fetch that the
// browser is allowed to finish after the tab closes. Same endpoint, same payload.
export const sendCertificationLessonProgressOnUnload = ({ programId, lessonId, watchPercent, positionSeconds }) => {
  const token = Cookies.get('token');
  return fetch(`${API_BASE_URL}/certification/programs/${programId}/lessons/${lessonId}/progress/`, {
    method: 'POST',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `token ${token}` } : {}),
    },
    body: JSON.stringify({ watch_percent: watchPercent, position_seconds: positionSeconds }),
  });
};

export const completeCertificationLesson = async ({ programId, lessonId, watchPercent }) => {
  return axios.post(`/certification/programs/${programId}/lessons/${lessonId}/complete/`, {
    watch_percent: watchPercent,
  });
};

export const getCertificationLessonQuiz = async ({ programId, lessonId }) => {
  return axios.get(`/certification/programs/${programId}/lessons/${lessonId}/quiz/`);
};

// answers: { [questionId]: [optionId, ...] }
export const submitCertificationLessonQuiz = async ({ programId, lessonId, answers }) => {
  return axios.post(`/certification/programs/${programId}/lessons/${lessonId}/quiz/submit/`, { answers });
};

export const checkoutCertificationProgram = async ({ id, ref }) => {
  return axios.post(`/certification/programs/${id}/checkout/`, ref ? { ref } : {});
};
