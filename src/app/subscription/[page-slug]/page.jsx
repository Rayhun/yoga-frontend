'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import SubscriptionPageDetails from '@/components/subscription/page/customer/SubscriptionPageDetails';
import { getSubscriptionPageDetailsBySlug } from '@/services/private/subscription/page';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const pageSlug = params['page-slug'];

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSubscriptionPageDetailsBySlug({ slug: pageSlug }),
    queryKey: [queryKeys.subscriptionPages, pageSlug],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <SubscriptionPageDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
