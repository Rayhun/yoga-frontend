'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import SubscriptionPlanDetails from '@/components/subscription/plan/admin/SubscriptionPlanDetails';
import { getSingleSubscriptionPlan } from '@/services/private/subscription/plan';
import queryKeys from '@/utils/query-keys';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();
  
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

  const headerActions = [
    {
      id: 'back',
      variant: 'outlined',
      onClick: () => router.back(),
      label: 'Back',
      Icon: MdOutlineArrowBack,
    },
  ];

  return (
    <div>
      <PageHeader title="Subscription Plan Details">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <SubscriptionPlanDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
