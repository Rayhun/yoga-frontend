'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import SubscriptionStatus from '@/components/subscription/common/SubscriptionStatus';
import JoinCircleSuccessView from '@/components/join/JoinCircleSuccessView';
import PageLoader from '@/components/common/loader/PageLoader';

const PaymentSuccessContent = () => {
  const searchParams = useSearchParams();
  const communitySlug = searchParams.get('exp-ref');

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
