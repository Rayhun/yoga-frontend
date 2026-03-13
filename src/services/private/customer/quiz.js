import axios from '@/lib/axios';

export const getSingleQuiz = async ({ id }) => {
  return axios.get(`/customer/quiz/${id}/`);
};
