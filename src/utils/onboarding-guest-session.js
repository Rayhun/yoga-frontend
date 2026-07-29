const STORAGE_PREFIX = 'onboarding_guest_session:';

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
