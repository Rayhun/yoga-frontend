'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import SubscriptionPageDetails from '@/components/subscription/page/SubscriptionPageDetails';
import { getSingleSubscriptionPage } from '@/services/private/subscription/page';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleSubscriptionPage({ id: params.id }),
    queryKey: [queryKeys.subscriptionPages, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Subscription Page Details" />
      <SubscriptionPageDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
