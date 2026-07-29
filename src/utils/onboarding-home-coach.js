import { API_V2_WEB_CUSTOMER_BASE_URL } from '@/utils/config';

export const ONBOARDING_HOME_COACH_PENDING_KEY = 'onboarding_home_coach_pending';

export function resolveOnboardHomeCoachUrl(url) {
  if (typeof url === 'string' && url.includes('/web/customer/onboard/home/coach/')) {
    return url;
  }
  return `${API_V2_WEB_CUSTOMER_BASE_URL}/onboard/home/coach/`;
}

export function extractConversationIdFromApiUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/conversations\/([^/]+)\/messages/i);
  return match?.[1] || null;
}

export function markHomeCoachPending() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(ONBOARDING_HOME_COACH_PENDING_KEY, '1');
  }
}

export function clearHomeCoachPending() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ONBOARDING_HOME_COACH_PENDING_KEY);
  }
}

export function isHomeCoachPending() {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ONBOARDING_HOME_COACH_PENDING_KEY) === '1';
}
