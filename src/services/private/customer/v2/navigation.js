import axios from '@/lib/axios';
import { API_V2_WEB_CUSTOMER_BASE_URL } from '@/utils/config';

export const getCustomerSidebarNavigation = () =>
  axios.get(`${API_V2_WEB_CUSTOMER_BASE_URL}/side/navigation/`);
