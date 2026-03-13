import axios from '@/lib/axios';

export const createStripeOnboardingLink = async () => {
  return axios.post('/expert-stripe-onboarding/');
};
