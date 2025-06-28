'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import SubscriptionPageDetails from '@/components/subscription/page/customer/SubscriptionPageDetails';
import { getSubscriptionPageDetailsBySlug } from '@/services/private/subscription/page';
import queryKeys from '@/utils/query-keys';
import FAQsList from '@/components/common/FAQsList';
import { useSearchParams } from 'next/navigation';

const Page = ({ params }) => {
  const pageSlug = params['page-slug'];
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSubscriptionPageDetailsBySlug({ slug: pageSlug, referralCode }),
    queryKey: [queryKeys.subscriptionPages, pageSlug, referralCode],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <SubscriptionPageDetails data={response?.data?.data} />
      <FAQsList />
    </div>
  );
};

export default Page;
