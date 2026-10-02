import axios from '@/lib/axios';

export const checkoutCertificationProgram = async ({ id, ref }) => {
  return axios.post(`/certification/programs/${id}/checkout/`, ref ? { ref } : {});
};
