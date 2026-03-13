import axios from '@/lib/axios';

export const authenticateUser = async () => {
  return axios.get('/auth/user');
};

export const loginUser = async ({ payload }) => {
  return axios.post('/auth/login', payload);
};

export const registerNewUser = async ({ payload }) => {
  return axios.post('/auth/register/', payload);
};

export const forgotPassword = async ({ payload }) => {
  return axios.post('/auth/forgotpassword', payload);
};

export const validatePasswordResetToken = async ({ payload }) => {
  return axios.post('/auth/forgotpassword/activate', payload);
};

export const resetPassword = async ({ payload }) => {
  return axios.patch('/auth/pasword', payload);
};

export const verifyEmail = async ({ payload }) => {
  return axios.post('/auth/verify-email-otp/', payload);
};

export const verifyPhone = async ({ payload }) => {
  return axios.post('/auth/verify-number-otp/', payload);
};

export const resendEmailOTPCode = async ({ payload }) => {
  return axios.post('/auth/resend-email-otp/', payload);
};

export const resendPhoneOTPCode = async ({ payload }) => {
  return axios.post('/auth/resend-number-otp/', payload);
};

export const checkEmailExists = async ({ email }) => {
  return axios.post('/auth/check-email/', { email });
};

export const checkPhoneExists = async ({ phone }) => {
  return axios.post('/auth/check-phone/', { phone });
};
