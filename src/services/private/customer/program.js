import axios from '@/lib/axios';
import dayjs from 'dayjs';
import { PROGRAM_PROGRESS } from '@/utils/enums';

export const getProgramsList = async ({ category = '' }) => {
  return axios.get(`/customer/program/?category=${category}`);
};

export const getSingleProgram = async ({ id }) => {
  return axios.get(`/customer/program/${id}/`);
};

export const enrollProgram = async ({ id }) => {
  return axios.post(`/customer/program/${id}/enroll/`);
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
