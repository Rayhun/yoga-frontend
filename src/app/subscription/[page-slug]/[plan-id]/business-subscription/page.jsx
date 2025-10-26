'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSingleSubscriptionPlan } from '@/services/private/subscription/plan';
import BusinessSubscriptionForm from '@/components/subscription/business/BusinessSubscriptionForm';
import queryKeys from '@/utils/query-keys';
import { toast } from 'react-toastify';

const BusinessSubscriptionPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const planId = params['plan-id'];
  const referralCode = searchParams.get('ref');

  const { data: planResponse, isLoading, error } = useQuery({
    queryFn: () => getSingleSubscriptionPlan({ id: planId }),
    queryKey: [queryKeys.subscriptionPlans, planId],
    enabled: !!planId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    toast.error('Failed to load subscription plan');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">Failed to load subscription plan details.</p>
        </div>
      </div>
    );
  }

  const planData = planResponse?.data?.data;

  if (!planData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Plan Not Found</h2>
          <p className="text-gray-600">The requested subscription plan could not be found.</p>
        </div>
      </div>
    );
  }

  if (planData.subscription_type !== 'Business') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Plan Type</h2>
          <p className="text-gray-600">This page is only for business subscription plans.</p>
          <p className="text-sm text-gray-500 mt-2">Current type: {planData.subscription_type}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <BusinessSubscriptionForm 
        planData={planData} 
        referralCode={referralCode}
      />
    </div>
  );
};

export default BusinessSubscriptionPage;
