import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getExpertGroupCoachingList = async ({id}) => {
  return axios.get(`/customer/expert/event/${id}`);
};

export const buyGroupCoaching = async ({ id }) => {
  return axios.post(`/event/checkout/`, { event: id });
};

export const getGroupCoachingDetails = async ({id}) => {
  return axios.get(`/customer/event/${id}`);
};

export const getCustomerGroupCoachingList = async params => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/customer/events/?${searchParams}`);
};

export const enrollGroupCoaching = async ({ id }) => {
  return axios.post(`/customer/event/${id}/enroll/`);
};

export const getEnrolledGroupCoachings = async () => {
  return axios.get(`/customer/my/events/`);
};
