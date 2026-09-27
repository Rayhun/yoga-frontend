import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

// Grading Queue (KAN-95/96) — assignment submissions on the caller's own programs.
// params: { status: 'pending' | 'passed' | 'needs_revision' | 'all', program_id?, limit?, offset? }
export const getGradingQueue = async params => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/certification/grading-queue/?${searchParams}`);
};

// payload: { passed: boolean, feedback?: string } — feedback is required when not passed.
export const gradeSubmission = async ({ id, payload }) => {
  return axios.post(`/certification/grading-queue/${id}/grade/`, payload);
};
