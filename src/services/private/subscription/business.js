import axios from '@/lib/axios';

/**
 * Create checkout session for business subscription
 * @param {Object} params - Business subscription checkout parameters
 * @param {string} params.id - Plan ID
 * @param {string} params.organizationName - Organization name
 * @param {number} params.employeeCount - Number of employees
 * @param {Object} params.selectedDiscount - Selected volume discount (optional)
 * @param {number} params.calculatedPrice - Calculated total price
 * @param {string} params.referralCode - Referral code (optional)
 * @returns {Promise} Axios response
 */
export const createBusinessSubscriptionCheckout = async ({
  id,
  organizationName,
  employeeCount,
  selectedDiscount,
  calculatedPrice,
  referralCode
}) => {
  const url = referralCode 
    ? `/subscription/plan/${id}/business-checkout/?ref=${referralCode}`
    : `/subscription/plan/${id}/business-checkout/`;
  
  return axios.post(url, {
    organizationName,
    employeeCount,
    selectedDiscount,
    calculatedPrice
  });
};

