import axios from '@/lib/axios';
import { API_V2_BASE_URL } from '@/utils/config';

export const getExpertReferrals = async () => {
  return axios.get(`${API_V2_BASE_URL}/expert/referrals/`);
};
