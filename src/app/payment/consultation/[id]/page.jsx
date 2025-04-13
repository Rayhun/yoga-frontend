'use client';
import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import queryKeys from '@/utils/query-keys';
import StripeCheckout from '@/components/subscription/checkout/StripeCheckout';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import { useParams } from 'next/navigation';
import { buyConsultation } from '@/services/private/customer/consultation';

const Page = () => {
  const params = useParams();
  const consultationId = params.id;

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => buyConsultation({ id: consultationId }),
    queryKey: [queryKeys.checkoutGroupCoaching, consultationId],
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
          <div className="text-center">Checkout Group Coaching Session not created properly</div>
        )}
      </LoadingWrapper>
    </div>
  );
};

export default Page;
