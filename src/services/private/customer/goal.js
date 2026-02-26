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

export const getTracker = async (params = {}) => {
  const searchParams = getSearchParamsFromObject(params);
  const qs = searchParams ? `?${searchParams}` : '';
  return axios.get(`/goal/tracker/user/${qs}`);
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

// Period Goal Tracking APIs (period range)
export const getPeriodGoal = async (month) => {
  // List period goals; backend supports optional month filter (YYYY-MM)
  const query = month ? `?month=${month}` : '';
  return axios.get(`/period-goal/list/${query}`);
};

export const createPeriodGoal = async (payload) => {
  // payload: { tracker_name, period_start, period_end }
  return axios.post('/period-goal/create/', payload);
};

export const updatePeriodGoal = async (id, payload) => {
  // payload: { tracker_name, period_start, period_end }
  return axios.put(`/period-goal/update/${id}/`, payload);
};

// Period Daily Goal Tracking APIs (per-day symptoms)
export const listPeriodDailyGoals = async (params = {}) => {
  // params: { tracker_name?, start_date?, end_date? } YYYY-MM-DD
  const searchParams = getSearchParamsFromObject(params);
  const qs = searchParams ? `?${searchParams}` : '';
  return axios.get(`/period-daily-goal/list/${qs}`);
};

export const createPeriodDailyGoal = async (payload) => {
  // payload: { tracker_name, tracker_date, selected_symptoms, symptom_levels }
  return axios.post('/period-daily-goal/create/', payload);
};

export const updatePeriodDailyGoal = async (id, payload) => {
  // payload: { tracker_name?, tracker_date?, selected_symptoms?, symptom_levels? }
  return axios.put(`/period-daily-goal/update/${id}/`, payload);
};

// Cycle Insights API
export const getCycleInsights = async () => {
  return axios.get('/goal/period/insight/');
};