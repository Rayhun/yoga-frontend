'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import SubscriptionPlanDetails from '@/components/subscription/plan/admin/SubscriptionPlanDetails';
import { getSingleSubscriptionPlan } from '@/services/private/subscription/plan';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleSubscriptionPlan({ id: params.id }),
    queryKey: [queryKeys.subscriptionPlans, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Subscription Plan Details" />
      <SubscriptionPlanDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
