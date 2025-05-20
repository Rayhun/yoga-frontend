import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getGoalList = async params => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/goal/?${searchParams}`);
};

export const getCocernList = async () => {
  return axios.get(`/goal/concern/`);
};

export const createGoalTracker = async ({ payload }) => {
  return axios.post('/goal/tracker/', payload);
};

export const getTracker = async () => {
  return axios.get('/goal/tracker/user/');
};

export const createTrackerActivity = async ({ payload }) => {
    return axios.post('/goal/tracker/activity/', payload);
  };