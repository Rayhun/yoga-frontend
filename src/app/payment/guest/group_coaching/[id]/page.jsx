'use client';
import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import queryKeys from '@/utils/query-keys';
import StripeCheckout from '@/components/subscription/checkout/StripeCheckout';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import { useParams } from 'next/navigation';
import { createGuestCheckoutSession } from '@/services/public/expert';
import useGeoLocation from '@/hooks/useGeoLocation';

const ALLOWED_COUNTRIES = ['US', 'CA', 'IN'];

const Page = () => {
  const params = useParams();
  const eventId = params.id;

  const { countryCode, isLoading: isGeoLoading } = useGeoLocation();
  const isDev = process.env.NEXT_PUBLIC_APP_ENVRONMENT === 'development';
  const isAllowed = isDev || (!!countryCode && ALLOWED_COUNTRIES.includes(countryCode));

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => createGuestCheckoutSession({ type: 'event', object_id: Number(eventId) || eventId }),
    queryKey: [queryKeys.guestCheckoutSession, 'event', eventId],
    enabled: !isGeoLoading && isAllowed,
  });

  useHandleApiResponse(failureReason);

  const clientSecret = response?.data?.data?.checkout_session_client_secret;

  if (isGeoLoading) {
    return <div className="text-center mt-10 text-gray-600">Detecting your location...</div>;
  }

  if (!isAllowed) {
    return (
      <div className="flex flex-col gap-5">
        <Alert className="mt-5" variant="filled" severity="error">
          We currently only support purchases from the United States, Canada, and India.
        </Alert>
      </div>
    );
  }

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
