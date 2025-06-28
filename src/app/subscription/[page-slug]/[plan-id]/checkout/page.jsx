'use client';
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

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => createCheckoutSessionForSubscriptionPlan({ id: planID, refferalCode }),
    queryKey: [queryKeys.stripeCheckoutSessions, planID, refferalCode],
  });

  useHandleApiResponse(failureReason);

  const clientSecret = response?.data?.data?.checkout_session_client_secret;

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <Alert className="mt-5" variant="filled" severity="warning">
          Please wait for a while. We are creating a checkout session for you. DO NOT refresh the page
        </Alert>
      </div>
      <LoadingWrapper isLoading={isLoading}>
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
