import axios from '@/lib/axios';
import { API_V2_WEB_CUSTOMER_BASE_URL } from '@/utils/config';

export const getCustomerHomePage = () =>
  axios.get(`${API_V2_WEB_CUSTOMER_BASE_URL}/home/page/`);

export const getCustomerAiModal = () =>
  axios.get(`${API_V2_WEB_CUSTOMER_BASE_URL}/ai/`);

export const fetchCustomerV2Section = url => axios.get(url);

export const getCustomerPeriodLogWizard = logUrl =>
  axios.get(logUrl);

export const saveCustomerPeriodLog = (submitUrl, payload) =>
  axios.post(submitUrl, payload);

export const getCustomerCheckinWizard = wizardUrl =>
  axios.get(wizardUrl);

export const saveCustomerCheckinLog = (submitUrl, payload) =>
  axios.post(submitUrl, payload);
