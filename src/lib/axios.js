import axios from 'axios';
import { API_BASE_URL } from '@/utils/config';
import { logRequestFailure, isLogApiRequest } from '@/utils/logger';
import Cookies from 'js-cookie';

/**
 * Single axios client for all frontend API requests. Failed requests are logged
 * via @/utils/logger (to log file with date/time). Use this client everywhere
 * so all request activity is managed in one place.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(req => {
  const token = Cookies.get('token');
  if (token) {
    req.headers.Authorization = `token ${token}`;
  }
  return req;
});

apiClient.interceptors.response.use(
  resp => resp,
  error => {
    const config = error.config ?? {};
    const response = error.response;

    // 401 with "Invalid token." → force logout and redirect to login
    if (response?.status === 401) {
      const detail = response?.data?.detail;
      if (typeof detail === 'string' && detail.toLowerCase().includes('invalid token')) {
        Cookies.remove('token');
        if (typeof window !== 'undefined') {
          window.location.replace('/auth/login');
        }
        return Promise.reject(error);
      }
    }

    if (isLogApiRequest(config)) {
      return Promise.reject(error);
    }
    logRequestFailure({
      method: config.method?.toUpperCase(),
      url: config.url ?? config.baseURL ?? 'unknown',
      status: response?.status,
      statusText: response?.statusText,
      message: response?.data?.message ?? response?.data?.detail ?? error.message,
      config: { baseURL: config.baseURL, params: config.params },
      rawError: error,
    });
    return Promise.reject(error);
  }
);

export default apiClient;
