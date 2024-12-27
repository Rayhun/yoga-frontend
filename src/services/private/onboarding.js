import axios from '@/lib/axios';

export const getOnboardingQuiz = async () => {
  return axios.get('/onboarding/quiz/');
};

export const submitOnboardingQuiz = async ({ payload }) => {
  return axios.post('/onboarding/submit-answers/', payload);
};
