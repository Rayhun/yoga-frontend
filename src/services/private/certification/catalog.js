import axios from '@/lib/axios';
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

export const completeCertificationLesson = async ({ programId, lessonId, watchPercent }) => {
  return axios.post(`/certification/programs/${programId}/lessons/${lessonId}/complete/`, {
    watch_percent: watchPercent,
  });
};

export const checkoutCertificationProgram = async ({ id, ref }) => {
  return axios.post(`/certification/programs/${id}/checkout/`, ref ? { ref } : {});
};
