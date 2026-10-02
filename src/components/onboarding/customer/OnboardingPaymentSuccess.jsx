'use client';

import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import Button from '@/components/common/Button';
import OnboardingWelcomeSuccess from '@/components/onboarding/customer/OnboardingWelcomeSuccess';
import { getPublicOnboardingPaymentSuccess } from '@/services/public/onboarding/quiz-v2';
import queryKeys from '@/utils/query-keys';
import {
  clearGuestSessionId,
  clearOnboardingCheckoutClientSecret,
  getOnboardingCheckoutGuestSessionId,
} from '@/utils/onboarding-guest-session';

async function fetchPaymentSuccess(guestSessionId) {
  const response = await getPublicOnboardingPaymentSuccess(guestSessionId);
  if (response.status === 202) {
    const error = new Error('Payment is still processing');
    error.response = response;
    throw error;
  }
  return response;
}

export default function OnboardingPaymentSuccessView() {
  const searchParams = useSearchParams();
  const guestSessionId =
    searchParams.get('guest_session_id') || getOnboardingCheckoutGuestSessionId();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [queryKeys.onboardingPaymentSuccess, guestSessionId],
    queryFn: () => fetchPaymentSuccess(guestSessionId),
    enabled: Boolean(guestSessionId),
    retry: (failureCount, error) => error?.response?.status === 202 && failureCount < 8,
    retryDelay: attempt => Math.min(1500 * (attempt + 1), 6000),
    refetchOnWindowFocus: false,
  });

  const payload = data?.data?.data;
  const welcomeData = payload?.welcome_success_screen;
  const pageSlug = payload?.page_slug;

  useEffect(() => {
    if (!welcomeData) return;
    clearOnboardingCheckoutClientSecret();
    if (pageSlug) {
      clearGuestSessionId(pageSlug);
    }
  }, [welcomeData, pageSlug]);

  const isProcessing = useMemo(() => {
    if (!guestSessionId) return false;
    return isLoading || isFetching;
  }, [guestSessionId, isLoading, isFetching]);

  if (!guestSessionId) {
    return (
      <div className="w-full max-w-md text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Missing onboarding session
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          We could not verify your payment session. Please check your email for login details.
        </p>
      </div>
    );
  }

  if (isProcessing && !welcomeData) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <PageLoader />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Finalizing your account… this usually takes a few seconds.
        </p>
      </div>
    );
  }

  if (isError || !welcomeData) {
    return (
      <div className="w-full max-w-md text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Still processing your payment
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          If you completed payment, your account may still be setting up. Try again or check your
          email for login details.
        </p>
        <Button className="mt-6" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <OnboardingWelcomeSuccess
      data={welcomeData}
      isPublic
      isPaymentComplete
      pageSlug={pageSlug}
      layout="embedded"
    />
  );
}
