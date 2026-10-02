import axios from '@/lib/axios';
import { API_V2_WEB_CUSTOMER_BASE_URL } from '@/utils/config';

export const getReliefPage = () =>
  axios.get(`${API_V2_WEB_CUSTOMER_BASE_URL}/relief/page/`);

export const getQuickTools = () =>
  axios.get(`${API_V2_WEB_CUSTOMER_BASE_URL}/quick/tools/`);

export const getReliefFaq = (params = {}) =>
  axios.get(`${API_V2_WEB_CUSTOMER_BASE_URL}/relief/faq/`, { params });

export const getReliefSaved = () =>
  axios.get(`${API_V2_WEB_CUSTOMER_BASE_URL}/relief/saved/`);

export const getReliefTrack = () =>
  axios.get(`${API_V2_WEB_CUSTOMER_BASE_URL}/relief/track/`);

export const getQuickDetail = category =>
  axios.get(`${API_V2_WEB_CUSTOMER_BASE_URL}/quick/${category}/`);

export const saveHydrationLog = (payload = {}) =>
  axios.post(`${API_V2_WEB_CUSTOMER_BASE_URL}/quick/hydration/log/saved/`, payload);

export const fetchReliefSection = url => axios.get(url);
