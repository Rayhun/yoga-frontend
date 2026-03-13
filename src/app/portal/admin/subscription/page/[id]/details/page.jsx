'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import SubscriptionPageDetails from '@/components/subscription/page/admin/SubscriptionPageDetails';
import { getSingleSubscriptionPage } from '@/services/private/subscription/page';
import queryKeys from '@/utils/query-keys';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();
  
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
      <PageHeader title="Subscription Page Details">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <SubscriptionPageDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
