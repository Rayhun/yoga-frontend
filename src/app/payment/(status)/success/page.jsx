'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import SubscriptionStatus from '@/components/subscription/common/SubscriptionStatus';
import JoinCircleSuccessView from '@/components/join/JoinCircleSuccessView';
import OnboardingPaymentSuccessView from '@/components/onboarding/customer/OnboardingPaymentSuccess';
import PageLoader from '@/components/common/loader/PageLoader';

const ONBOARDING_SUCCESS_BG =
  'bg-gradient-to-b from-emerald-50/80 via-[#faf9f7] to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950';

const PaymentSuccessContent = () => {
  const searchParams = useSearchParams();
  const communitySlug = searchParams.get('exp-ref');
  const isOnboardingGuest = searchParams.get('onboarding-guest') === '1';

  useEffect(() => {
    if (!isOnboardingGuest) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflowX = document.documentElement.style.overflowX;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflowX = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflowX = previousHtmlOverflowX;
    };
  }, [isOnboardingGuest]);

  if (isOnboardingGuest) {
    return (
      <div
        className={`fixed inset-0 z-30 box-border flex items-center justify-center overflow-hidden px-4 sm:px-6 ${ONBOARDING_SUCCESS_BG}`}
      >
        <div className="w-full min-w-0 max-w-lg">
          <OnboardingPaymentSuccessView />
        </div>
      </div>
    );
  }

  if (communitySlug) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
        <JoinCircleSuccessView slug={communitySlug} />
      </div>
    );
  }

  return <SubscriptionStatus variant="success" />;
};

const Page = () => (
  <Suspense fallback={<PageLoader />}>
    <PaymentSuccessContent />
  </Suspense>
);

export default Page;
