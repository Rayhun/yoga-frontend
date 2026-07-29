import axios from '@/lib/axios';
import { API_V2_BASE_URL } from '@/utils/config';
import { runDeduped } from '@/utils/deduped-async';

const DEDUPE_FIRST_QUESTION_KEY = 'onboarding:v2:first-question';

const QUESTIONS_BASE = `${API_V2_BASE_URL}/onboarding/quiz/questions`;

/**
 * Paginated list (`data`: `{ count, next, previous, results }`) matching Tag API shape.
 * Use a high `limit` when loading all rows for validation (e.g. unique question order).
 */
export const getOnboardingV2QuestionsList = async ({
  limit = 20,
  offset = 0,
  search = '',
  status = '',
} = {}) => {
  return axios.get(`${QUESTIONS_BASE}/`, {
    params: { limit, offset, search, status },
  });
};

export const getOnboardingV2Question = async ({ id }) => {
  return axios.get(`${QUESTIONS_BASE}/${id}/`);
};

export const createOnboardingV2Question = async ({ payload }) => {
  return axios.post(`${QUESTIONS_BASE}/`, payload);
};

export const updateOnboardingV2Question = async ({ payload: { id, ...rest } }) => {
  return axios.put(`${QUESTIONS_BASE}/${id}/`, rest);
};

export const deleteOnboardingV2Question = async ({ id }) => {
  return axios.delete(`${QUESTIONS_BASE}/${id}/`);
};

export const getOnboardingV2FirstQuestion = async ({ slug } = {}) => {
  const dedupeKey = slug ? `${DEDUPE_FIRST_QUESTION_KEY}:${slug}` : DEDUPE_FIRST_QUESTION_KEY;
  const path = slug
    ? `${API_V2_BASE_URL}/onboarding/quiz/first-question/${encodeURIComponent(slug)}/`
    : `${API_V2_BASE_URL}/onboarding/quiz/first-question/`;

  return runDeduped(dedupeKey, () => axios.get(path));
};

export const submitOnboardingV2Answer = async ({ payload }) => {
  return axios.post(`${API_V2_BASE_URL}/onboarding/quiz/submit-answer/`, payload);
};

export const getOnboardHomeCoach = coachUrl =>
  axios.get(coachUrl);

export const saveOnboardHomeCoach = (submitUrl, payload) =>
  axios.post(submitUrl, payload);
