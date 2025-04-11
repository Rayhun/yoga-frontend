import axios from '@/lib/axios';

export const getExpertGroupCoachingList = async ({id}) => {
  return axios.get(`/customer/expert/event/${id}`);
};

export const buyGroupCoaching = async ({ id }) => {
  return axios.post(`/event/checkout/`, { event: id });
};