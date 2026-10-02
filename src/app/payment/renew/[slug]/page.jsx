'use client';

import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import { useParams } from 'next/navigation';
import useGeoLocation from '@/hooks/useGeoLocation';
import StripeCheckout from '@/components/subscription/checkout/StripeCheckout';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import { createCommunityRenewCheckoutSession } from '@/services/private/expert/community';
import { toastApiError } from '@/utils/helpers';

const ALLOWED_COUNTRIES = ['US', 'CA', 'IN'];

const Page = () => {
  const params = useParams();
  const slug = params?.slug;
  const [clientSecret, setClientSecret] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { countryCode, isLoading: isGeoLoading } = useGeoLocation();
  const isDev = process.env.NEXT_PUBLIC_APP_ENVRONMENT === 'development';
  const isAllowed = isDev || (!!countryCode && ALLOWED_COUNTRIES.includes(countryCode));

  useEffect(() => {
    if (!slug || isGeoLoading || !isAllowed) return;

    let cancelled = false;

    const loadCheckout = async () => {
      setIsLoading(true);
      try {
        const cached =
          typeof window !== 'undefined'
            ? sessionStorage.getItem(`expertRenewCheckout:${slug}`)
            : null;

        if (cached) {
          if (!cancelled) {
            setClientSecret(cached);
            setIsLoading(false);
            sessionStorage.removeItem(`expertRenewCheckout:${slug}`);
          }
          return;
        }

        const { data: response } = await createCommunityRenewCheckoutSession({ slug });
        const secret = response?.data?.checkout_session_client_secret;
        if (!cancelled) {
          setClientSecret(secret || null);
        }
      } catch (error) {
        if (!cancelled) {
          toastApiError(error);
          setClientSecret(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadCheckout();
    return () => {
      cancelled = true;
    };
  }, [slug, isGeoLoading, isAllowed]);

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
      <LoadingWrapper isLoading={isLoading}>
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
