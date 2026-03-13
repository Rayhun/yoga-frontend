/**
 * Frontend request failure logger – single place for all failed API requests.
 * Sends entries to the server to be written to a log file (date/time) in both dev and production.
 * Use the axios client from @/lib/axios for all API calls so failures are captured here.
 */

export const LOG_API_PATH = '/api/log-request-failure';

/**
 * Send log entry to the server to be written to a file (one file per day, with datetime).
 * Only runs in the browser (skipped during SSR/build). Uses fetch to avoid axios interceptor.
 */
function writeToLogFile(entry) {
  if (typeof window === 'undefined') return;
  const url = `${window.location.origin}${LOG_API_PATH}`;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
    keepalive: true,
  }).catch(() => {
    // Avoid axios/console to prevent loops; log API failure is silent
  });
}

/**
 * Returns true if the request was to our log API (caller should not log again to avoid recursion).
 */
export function isLogApiRequest(urlOrConfig) {
  const url = typeof urlOrConfig === 'string' ? urlOrConfig : urlOrConfig?.url ?? '';
  return String(url).includes(LOG_API_PATH);
}

/**
 * Log a failed API request with method, url, status, and error details.
 * Data is written to a log file with date/time (e.g. logs/api-failures-YYYY-MM-DD.log).
 * @param {Object} payload
 * @param {string} payload.method - HTTP method (GET, POST, etc.)
 * @param {string} payload.url - Request URL (full or path)
 * @param {number} [payload.status] - Response status code if available
 * @param {string} [payload.statusText] - Response status text
 * @param {string} [payload.message] - Error message
 * @param {Object} [payload.config] - Axios request config (baseURL, params, etc.)
 * @param {*} [payload.rawError] - Original error object
 */
export function logRequestFailure({ method, url, status, statusText, message, config, rawError }) {
  const msg = message ?? rawError?.message ?? 'Unknown error';
  const entry = {
    timestamp: new Date().toISOString(),
    type: 'REQUEST_FAILED',
    method: method ?? 'UNKNOWN',
    url: url ?? '',
    status: status ?? null,
    statusText: statusText ?? null,
    message: msg,
    msg: msg,
    ...(config && { baseURL: config.baseURL, params: config.params }),
  };

  writeToLogFile(entry);
  return entry;
}

const logger = { logRequestFailure, isLogApiRequest, LOG_API_PATH };
export default logger;
