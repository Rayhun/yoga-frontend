'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { createCheckoutSessionForSubscriptionPlan } from '@/services/private/subscription/plan';
import queryKeys from '@/utils/query-keys';
import StripeCheckout from '@/components/subscription/checkout/StripeCheckout';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import { useSearchParams } from 'next/navigation';

const Page = ({ params }) => {
  const planID = params['plan-id'];
  const searchParams = useSearchParams();
  const refferalCode = searchParams.get('ref');

  // null = not checked yet, false = not business, true = is business
  const [isBusinessSubscription, setIsBusinessSubscription] = useState(null);
  const [existingClientSecret, setExistingClientSecret] = useState(null);

  // Check localStorage after mount (client-side only)
  useEffect(() => {
    const storedClientSecret = localStorage.getItem('stripe_client_secret');
    const businessData = localStorage.getItem('business_subscription_data');
    
    if (storedClientSecret && businessData) {
      setExistingClientSecret(storedClientSecret);
      setIsBusinessSubscription(true);
      // Clear the stored data after using it
      localStorage.removeItem('stripe_client_secret');
      localStorage.removeItem('business_subscription_data');
    } else {
      setIsBusinessSubscription(false);
    }
  }, []);

  // Only fetch new session if confirmed NOT a business subscription
  // isBusinessSubscription === false means we checked and it's individual
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => createCheckoutSessionForSubscriptionPlan({ id: planID, refferalCode }),
    queryKey: [queryKeys.stripeCheckoutSessions, planID, refferalCode],
    enabled: isBusinessSubscription === false, // Only run when confirmed NOT business
  });

  useHandleApiResponse(failureReason);

  // Use existing client secret for business, or new one for individual
  const clientSecret = existingClientSecret || response?.data?.data?.checkout_session_client_secret;

  // Show loading while checking localStorage or fetching checkout session
  const isCheckingOrLoading = isBusinessSubscription === null || (isBusinessSubscription === false && isLoading);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <Alert className="mt-5" variant="filled" severity="warning">
          Please wait for a while. We are creating a checkout session for you. DO NOT refresh the page
        </Alert>
      </div>
      <LoadingWrapper isLoading={isCheckingOrLoading}>
        {clientSecret ? (
          <StripeCheckout clientSecret={clientSecret} />
        ) : (
          <div className="text-center">Checkout Session not created properly</div>
        )}
      </LoadingWrapper>
    </div>
  );
};

export default Page;
