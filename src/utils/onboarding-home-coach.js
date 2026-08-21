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
  const apiMatch = url.match(/conversations\/([^/?#]+)\/messages/i);
  if (apiMatch?.[1]) return apiMatch[1];
  try {
    const parsed = url.startsWith('http') ? new URL(url) : new URL(url, 'http://local.invalid');
    return parsed.searchParams.get('conversation');
  } catch {
    const queryMatch = url.match(/[?&]conversation=([^&]+)/i);
    return queryMatch?.[1] ? decodeURIComponent(queryMatch[1]) : null;
  }
}

export function resolveHomeCoachCommunityPath(primaryAction) {
  const conversationId =
    primaryAction?.conversation_id ||
    extractConversationIdFromApiUrl(primaryAction?.frontend_url) ||
    extractConversationIdFromApiUrl(primaryAction?.url);
  if (conversationId) {
    return `/portal/inbox?conversation=${conversationId}`;
  }
  if (typeof primaryAction?.frontend_url === 'string' && primaryAction.frontend_url.startsWith('/portal/')) {
    return primaryAction.frontend_url;
  }
  return '/portal/inbox';
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
