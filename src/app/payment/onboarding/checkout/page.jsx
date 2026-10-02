'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import PaymentStripeCheckoutLayout from '@/components/subscription/checkout/PaymentStripeCheckoutLayout';
import {
  getOnboardingCheckoutClientSecret,
  getOnboardingCheckoutPageSlug,
} from '@/utils/onboarding-guest-session';

const Page = () => {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setClientSecret(getOnboardingCheckoutClientSecret());
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="mt-10 text-center text-gray-600">
        Please wait for a while. We are creating a checkout session for you. DO NOT refresh the page
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Checkout session expired
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Please return to onboarding and choose your home coach again.
        </p>
        <Button
          className="mt-6"
          onClick={() => {
            const slug = getOnboardingCheckoutPageSlug();
            router.push(slug ? `/onboarding/${slug}` : '/onboarding');
          }}
        >
          Back to onboarding
        </Button>
      </div>
    );
  }

  return (
    <PaymentStripeCheckoutLayout
      clientSecret={clientSecret}
      warningMessage="Complete your membership to join your coach's circle. Please do not refresh this page."
      emptyMessage="Checkout session not created properly"
    />
  );
};

export default Page;
