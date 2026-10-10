import axios from '@/lib/axios';

/**
 * The learner's own certificate for a program. 403 until every required lesson is done;
 * the backend issues the row on demand, so the code is stable across refreshes.
 */
export const getProgramCertificate = async ({ id }) => {
  return axios.get(`/certification/programs/${id}/certificate/`);
};
