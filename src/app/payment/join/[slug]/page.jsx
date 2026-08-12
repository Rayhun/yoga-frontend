'use client';

import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import { useParams } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import useGeoLocation from '@/hooks/useGeoLocation';
import queryKeys from '@/utils/query-keys';
import StripeCheckout from '@/components/subscription/checkout/StripeCheckout';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import {
  createCommunityJoinCheckoutSession,
  getExpertCommunityJoinDetail,
} from '@/services/private/expert/community';
import { getCircleJoinGuest } from '@/utils/circle-join-guest';

const ALLOWED_COUNTRIES = ['US', 'CA', 'IN'];

const Page = () => {
  const params = useParams();
  const slug = params?.slug;

  const { countryCode, isLoading: isGeoLoading } = useGeoLocation();
  const isDev = process.env.NEXT_PUBLIC_APP_ENVRONMENT === 'development';
  const isAllowed = isDev || (!!countryCode && ALLOWED_COUNTRIES.includes(countryCode));

  const { data: joinDetailResponse } = useQuery({
    queryFn: () => getExpertCommunityJoinDetail(slug),
    queryKey: [queryKeys.expertCommunityJoinDetail, slug],
    enabled: !!slug,
  });

  const primaryButton = joinDetailResponse?.data?.data?.footer_actions?.primary_button;
  const checkoutMethod = primaryButton?.method || 'post';
  const stripeUrl = primaryButton?.stripe_url;

  const guest = getCircleJoinGuest(slug);

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () =>
      createCommunityJoinCheckoutSession({
        slug,
        stripeUrl,
        method: checkoutMethod,
        email: guest.email,
        full_name: guest.full_name,
        first_name: guest.first_name,
        last_name: guest.last_name,
      }),
    queryKey: [
      queryKeys.communityJoinCheckout,
      slug,
      checkoutMethod,
      stripeUrl,
      guest.email,
      guest.full_name,
    ],
    enabled: !!slug && !isGeoLoading && isAllowed && !!joinDetailResponse,
  });

  useHandleApiResponse(failureReason);

  const clientSecret = response?.data?.data?.checkout_session_client_secret;

  if (isGeoLoading) {
    return <div className="mt-10 text-center text-gray-600">Detecting your location...</div>;
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
          Please wait for a while. We are creating a checkout session for you. DO NOT refresh the
          page
        </Alert>
      </div>
      <LoadingWrapper isLoading={isLoading || !joinDetailResponse}>
        {clientSecret ? (
          <StripeCheckout clientSecret={clientSecret} />
        ) : (
          <div className="text-center">Checkout session not created properly</div>
        )}
      </LoadingWrapper>
    </div>
  );
};

export default Page;
