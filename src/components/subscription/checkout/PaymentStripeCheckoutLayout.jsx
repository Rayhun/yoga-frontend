'use client';

import Alert from '@mui/material/Alert';
import StripeCheckout from '@/components/subscription/checkout/StripeCheckout';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import useGeoLocation from '@/hooks/useGeoLocation';

const ALLOWED_COUNTRIES = ['US', 'CA', 'IN'];

const DEFAULT_WARNING =
  'Please wait for a while. We are creating a checkout session for you. DO NOT refresh the page';

export default function PaymentStripeCheckoutLayout({
  clientSecret,
  isLoading = false,
  warningMessage = DEFAULT_WARNING,
  emptyMessage = 'Checkout session not created properly',
  geoLoadingMessage = 'Detecting your location...',
}) {
  const { countryCode, isLoading: isGeoLoading } = useGeoLocation();
  const isDev = process.env.NEXT_PUBLIC_APP_ENVRONMENT === 'development';
  const isAllowed = isDev || (!!countryCode && ALLOWED_COUNTRIES.includes(countryCode));

  if (isGeoLoading) {
    return <div className="mt-10 text-center text-gray-600">{geoLoadingMessage}</div>;
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
          {warningMessage}
        </Alert>
      </div>
      <LoadingWrapper isLoading={isLoading}>
        {clientSecret ? (
          <StripeCheckout clientSecret={clientSecret} />
        ) : (
          <div className="text-center">{emptyMessage}</div>
        )}
      </LoadingWrapper>
    </div>
  );
}
