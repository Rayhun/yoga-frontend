'use client';
import { useEffect, useState } from 'react';
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

  // Check for existing client secret from business subscription
  const [existingClientSecret, setExistingClientSecret] = useState(null);
  const [isBusinessSubscription, setIsBusinessSubscription] = useState(false);

  useEffect(() => {
    // Check if coming from business subscription
    const storedClientSecret = localStorage.getItem('stripe_client_secret');
    const businessData = localStorage.getItem('business_subscription_data');
    
    if (storedClientSecret && businessData) {
      setExistingClientSecret(storedClientSecret);
      setIsBusinessSubscription(true);
      // Clear the stored data after using it
      localStorage.removeItem('stripe_client_secret');
      localStorage.removeItem('business_subscription_data');
    }
  }, []);

  // Only fetch new session if not a business subscription
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => createCheckoutSessionForSubscriptionPlan({ id: planID, refferalCode }),
    queryKey: [queryKeys.stripeCheckoutSessions, planID, refferalCode],
    enabled: !isBusinessSubscription, // Only run for individual subscriptions
  });

  useHandleApiResponse(failureReason);

  // Use existing client secret for business, or new one for individual
  const clientSecret = existingClientSecret || response?.data?.data?.checkout_session_client_secret;

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <Alert className="mt-5" variant="filled" severity="warning">
          Please wait for a while. We are creating a checkout session for you. DO NOT refresh the page
        </Alert>
      </div>
      <LoadingWrapper isLoading={isLoading && !existingClientSecret}>
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
