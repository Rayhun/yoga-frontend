export function getSafeRedirectPath(path) {
  if (!path || typeof path !== 'string') return null;

  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return null;
  }

  if (!decoded.startsWith('/') || decoded.startsWith('//')) return null;
  return decoded;
}

export function buildLoginUrl(returnPath) {
  const safePath = getSafeRedirectPath(returnPath);
  if (!safePath) return '/auth/login';
  return `/auth/login?next=${encodeURIComponent(safePath)}`;
}

export function getOnboardingRedirectPath(nextPath) {
  const safePath = getSafeRedirectPath(nextPath);
  if (safePath?.startsWith('/onboarding')) return safePath;
  return '/onboarding';
}
