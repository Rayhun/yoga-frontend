import axios from '@/lib/axios';
import { API_V1_BASE_URL, API_V2_BASE_URL } from '@/utils/config';

export const getExpertCommunityData = async () => {
  return axios.get(`${API_V2_BASE_URL}/expert/community/data/`);
};

export const getExpertCommunityDetail = async () => {
  return axios.get(`${API_V2_BASE_URL}/expert/community/detail/`);
};

export const checkExpertCircleTitle = async title => {
  return axios.post(`${API_V2_BASE_URL}/expert/community/circle-title/check/`, { title });
};

export const updateExpertCircleTitle = async title => {
  return axios.post(`${API_V2_BASE_URL}/expert/community/circle-title/`, { title });
};

export const getExpertCommunityJoinDetail = async slug => {
  return axios.get(`${API_V2_BASE_URL}/expert/community/detail/join/${slug}/`);
};

export const getExpertCommunityJoinOnboard = async slug => {
  return axios.get(`${API_V2_BASE_URL}/expert/community/join/onboard/${slug}/`);
};

export const createCommunityJoinCheckoutSession = async ({
  slug,
  stripeUrl,
  method = 'post',
  email,
  full_name,
  first_name,
  last_name,
} = {}) => {
  return executeCommunityAction({
    url: stripeUrl || `${API_V2_BASE_URL}/expert/community/join/subscription/`,
    method,
    payload: {
      group_slug: slug,
      ...(email ? { email } : {}),
      ...(full_name ? { full_name } : {}),
      ...(first_name ? { first_name } : {}),
      ...(last_name ? { last_name } : {}),
    },
  });
};

export const createCommunityRenewCheckoutSession = async ({ slug } = {}) => {
  return axios.post(`${API_V2_BASE_URL}/expert/community/renew/subscription/`, {
    group_slug: slug,
  });
};

export const getExpertCommunityJoinedSuccess = async slug => {
  return axios.get(`${API_V2_BASE_URL}/expert/community/joined/${slug}/success/`);
};

export const resolveActionUrl = url => {
  if (!url) return null;

  if (url.startsWith('http')) {
    try {
      const { pathname } = new URL(url);
      if (pathname.startsWith('/api/v2/')) {
        return `${API_V2_BASE_URL}${pathname.replace('/api/v2', '')}`;
      }
      if (pathname.startsWith('/api/v1/')) {
        return `${API_V1_BASE_URL}${pathname.replace('/api/v1', '')}`;
      }
      return pathname;
    } catch {
      return url;
    }
  }

  if (url.includes('/api/v2/')) {
    const v2Path = url.split('/api/v2/')[1]?.replace(/^\//, '');
    return `${API_V2_BASE_URL}/${v2Path}`;
  }

  if (url.includes('/api/v1/')) {
    const v1Path = url.split('/api/v1/')[1]?.replace(/^\//, '');
    return `${API_V1_BASE_URL}/${v1Path}`;
  }

  return url.startsWith('/') ? url : `/${url}`;
};

export const resolveCommunityActionUrl = url => resolveActionUrl(url);

export const executeCommunityAction = async ({ url, method = 'post', payload } = {}) => {
  const actionUrl = resolveActionUrl(url);
  if (!actionUrl) {
    throw new Error('Action URL is missing');
  }

  const normalizedMethod = method.toLowerCase();
  if (normalizedMethod === 'get') {
    return axios.get(actionUrl, { params: payload });
  }
  if (normalizedMethod === 'put') {
    return axios.put(actionUrl, payload);
  }
  if (normalizedMethod === 'patch') {
    return axios.patch(actionUrl, payload);
  }

  return axios.post(actionUrl, payload);
};

export const toAppPath = url => {
  if (!url) return null;
  if (url.startsWith('http')) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  return url.startsWith('/') ? url : `/${url}`;
};
