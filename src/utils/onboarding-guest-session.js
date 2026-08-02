const STORAGE_PREFIX = 'onboarding_guest_session:';
const CHECKOUT_SECRET_KEY = 'onboarding_checkout_client_secret';
const CHECKOUT_PAGE_SLUG_KEY = 'onboarding_checkout_page_slug';
const CHECKOUT_GUEST_SESSION_KEY = 'onboarding_checkout_guest_session_id';

export function getGuestSessionId(pageSlug) {
  if (typeof window === 'undefined' || !pageSlug) return null;
  return localStorage.getItem(`${STORAGE_PREFIX}${pageSlug}`);
}

export function setGuestSessionId(pageSlug, sessionId) {
  if (typeof window === 'undefined' || !pageSlug || !sessionId) return;
  localStorage.setItem(`${STORAGE_PREFIX}${pageSlug}`, sessionId);
}

export function clearGuestSessionId(pageSlug) {
  if (typeof window === 'undefined' || !pageSlug) return;
  localStorage.removeItem(`${STORAGE_PREFIX}${pageSlug}`);
}

export function setOnboardingCheckoutClientSecret(clientSecret, pageSlug, guestSessionId) {
  if (typeof window === 'undefined' || !clientSecret) return;
  sessionStorage.setItem(CHECKOUT_SECRET_KEY, clientSecret);
  if (pageSlug) {
    sessionStorage.setItem(CHECKOUT_PAGE_SLUG_KEY, pageSlug);
  }
  if (guestSessionId) {
    sessionStorage.setItem(CHECKOUT_GUEST_SESSION_KEY, guestSessionId);
  }
}

export function getOnboardingCheckoutClientSecret() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(CHECKOUT_SECRET_KEY);
}

export function getOnboardingCheckoutPageSlug() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(CHECKOUT_PAGE_SLUG_KEY);
}

export function getOnboardingCheckoutGuestSessionId() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(CHECKOUT_GUEST_SESSION_KEY);
}

export function clearOnboardingCheckoutClientSecret() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(CHECKOUT_SECRET_KEY);
  sessionStorage.removeItem(CHECKOUT_PAGE_SLUG_KEY);
  sessionStorage.removeItem(CHECKOUT_GUEST_SESSION_KEY);
}
