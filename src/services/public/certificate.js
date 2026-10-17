import axios from '@/lib/axios';

/**
 * Public verification of a certificate code (the QR target). No auth — anyone holding the
 * link must be able to confirm it, so this deliberately stays out of the private services.
 */
export const verifyCertificate = async ({ code }) => {
  return axios.get(`/certification/verify/${code}/`);
};
