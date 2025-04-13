import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getExpertProgramsList = async () => {
  // const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/expert/programs`);
};
