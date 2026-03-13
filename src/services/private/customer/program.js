import axios from '@/lib/axios';
import dayjs from 'dayjs';
import { PROGRAM_PROGRESS } from '@/utils/enums';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getProgramsList = async params => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/customer/program/?${searchParams}`);
};

export const getEnrolledProgramsList = async ({ status = '' }) => {
  return axios.get(`/customer/my/program/?status=${status}`);
};

export const getSingleProgram = async ({ id }) => {
  return axios.get(`/customer/program/${id}/`);
};

export const enrollProgram = async ({ id }) => {
  return axios.post(`/customer/program/${id}/enroll/`);
};

export const buyProgram = async ({ id }) => {
  return axios.post(`/program/checkout/`, { program: id });
};

export const updateProgramContentProgress = async ({ id, ...payload }) => {
  return axios.post(`/customer/program/${id}/progress/`, payload);
};

export const completeProgramContent = async ({ id, ...payload }) => {
  return axios.post(`/customer/program/${id}/progress/`, {
    ...payload,
    status: PROGRAM_PROGRESS.completed,
    completed_at: dayjs().format('YYYY-MM-DD'),
  });
};

export const getExpertProgramsList = async ({ id }) => {
  return axios.get(`/customer/expert/programs/${id}`);
};

export const getDailyDoseQuickRelief = async () => {
  return axios.get('/customer/program/daily_dose_quick_relief/');
};
