import axios from '@/lib/axios';

export const getHomeCardsConfig = async () => {
  return axios.get('/LMS/home-cards/');
};

export const updateHomeCardsConfig = async (payload) => {
  return axios.put('/LMS/home-cards/', payload);
};
