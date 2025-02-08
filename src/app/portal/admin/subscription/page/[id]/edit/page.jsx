'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import SubscriptionPageForm from '@/components/subscription/page/SubscriptionPageForm';
import { getSingleTag } from '@/services/private/lms/tag';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleTag({ id: params.id }),
    queryKey: [queryKeys.lmsTags, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Edit Subscription Page" />
      <SubscriptionPageForm selected={response?.data?.data} />
    </div>
  );
};

export default Page;
