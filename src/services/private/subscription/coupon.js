import axios from '@/lib/axios';

export const getCouponsList = async () => {
  const response = await axios.get('/payments/coupons/');
  // API wraps data in { status, data: [...] } — unwrap so useTable gets an array via response.data
  return { data: response.data.data };
};

export const addNewCoupon = async ({ payload }) => {
  return axios.post('/payments/coupons/', payload);
};

export const updateExistingCoupon = async ({ payload: { id, ...payload } }) => {
  return axios.put(`/payments/coupons/${id}/`, payload);
};

export const getSingleCoupon = async ({ id }) => {
  return axios.get(`/payments/coupons/${id}/`);
};

export const deleteSingleCoupon = async ({ id }) => {
  return axios.delete(`/payments/coupons/${id}/`);
};

export const getPaymentPlanOptions = async () => {
  return axios.get('/subscription/plan/');
};
