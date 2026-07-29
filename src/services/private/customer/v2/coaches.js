import axios from '@/lib/axios';
import { API_V2_WEB_CUSTOMER_BASE_URL } from '@/utils/config';

export const getCustomerCoachDetail = coachId =>
  axios.get(`${API_V2_WEB_CUSTOMER_BASE_URL}/coach/detail/${coachId}/`);

export const toggleFollowCoach = expertId =>
  axios.post(`${API_V2_WEB_CUSTOMER_BASE_URL}/follow/coach/${expertId}/`);

export const getDiscoverCommunityCoaches = (params = {}) =>
  axios.get(`${API_V2_WEB_CUSTOMER_BASE_URL}/community/coaches/discover/`, { params });
