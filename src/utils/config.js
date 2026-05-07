export const PORT = process.env.PORT ?? '5000';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? `http://localhost:${PORT}`;

const stripTrailingSlashes = value => value.replace(/\/+$/, '');
const stripVersionSuffix = value => value.replace(/\/v[0-9]+$/, '');

const defaultApiRoot = (() => {
  const base = stripTrailingSlashes(API_BASE_URL);
  if (base.endsWith('/api')) return base;
  if (/\/api\/v[0-9]+$/.test(base)) return stripVersionSuffix(base);
  return `${base}/api`;
})();

export const API_ROOT_URL = stripTrailingSlashes(
  process.env.NEXT_PUBLIC_API_ROOT_URL || defaultApiRoot
);
export const API_V1_BASE_URL = stripTrailingSlashes(
  process.env.NEXT_PUBLIC_API_V1_BASE_URL || `${API_ROOT_URL}/v1`
);
export const API_V2_BASE_URL = stripTrailingSlashes(
  process.env.NEXT_PUBLIC_API_V2_BASE_URL || `${API_ROOT_URL}/v2`
);
