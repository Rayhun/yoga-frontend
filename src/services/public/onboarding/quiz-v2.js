import axios from '@/lib/axios';
import { API_V2_BASE_URL } from '@/utils/config';
import { runDeduped } from '@/utils/deduped-async';

const PUBLIC_BASE = `${API_V2_BASE_URL}/onboarding/quiz/public`;

export const getPublicOnboardingFirstQuestion = async ({ slug, guestSessionId } = {}) => {
  const dedupeKey = `onboarding:public:first-question:${slug}:${guestSessionId || 'new'}`;
  const params = guestSessionId ? { guest_session_id: guestSessionId } : {};
  return runDeduped(dedupeKey, () =>
    axios.get(`${PUBLIC_BASE}/first-question/${encodeURIComponent(slug)}/`, { params })
  );
};

export const submitPublicOnboardingAnswer = async ({ payload }) => {
  return axios.post(`${PUBLIC_BASE}/submit-answer/`, payload);
};

export const getPublicOnboardHomeCoach = () => axios.get(`${PUBLIC_BASE}/home-coach/`);

export const savePublicOnboardHomeCoach = payload =>
  axios.post(`${PUBLIC_BASE}/home-coach/saved/`, payload);

export const completePublicOnboardingSignup = async ({ payload }) => {
  return axios.post(`${PUBLIC_BASE}/complete-signup/`, payload);
};
