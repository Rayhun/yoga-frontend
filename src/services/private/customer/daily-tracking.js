import axios from '@/lib/axios';

export const getDailyTrackingData = async () => {
  return axios.get('/dail/tracking/data/');
};

export const postDailyTrackingLog = async body => {
  return axios.post('/dail/tracking/log/', body);
};
