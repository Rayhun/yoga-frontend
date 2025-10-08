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

export const getTrackerInfo = async () => {
  return axios.get('/goal/tracker/info/');
};

export const createTrackerActivity = async ({ payload }) => {
  return axios.post('/goal/tracker/activity/', payload);
};

export const getDailyInsights = async () => {
  return axios.get('/goal/insight/');
};

// Admin Side tracker APIs 
export const adminGetInsightsGoals = async () => {
  return axios.get('/goal/tracker/insight/');
};

export const importInsightsGoal = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/goal/insight/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteSingleInsight = async ({ id }) => {
  return axios.delete(`/goal/tracker/insight/${id}/`);
};

export const adminGetGoalsTracker = async () => {
  return axios.get('/goal/');
};

export const importGoalsTracker = async ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/goal/insight/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const adminGetGoalsTrackerDetails = async (id) => {
  return axios.get(`/goal/${id}`);
};

// Period Goal Tracking APIs
export const getPeriodGoal = async (month) => {
  return axios.get(`/goal-tracking/period-goal?month=${month}`);
};

export const createPeriodGoal = async (payload) => {
  return axios.post('/goal-tracking/period-goal/', payload);
};

export const updatePeriodGoal = async (id, payload) => {
  return axios.put(`/goal-tracking/period-goal/${id}/`, payload);
};