import axios from 'axios';
import { API_BASE_URL } from '@/utils/config';
import Cookies from 'js-cookie';

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

apiClient.interceptors.response.use(resp => {
  //handle auth etc
  return resp;
});

export default apiClient;
