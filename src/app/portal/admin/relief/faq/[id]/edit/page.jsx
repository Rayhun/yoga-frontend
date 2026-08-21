'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import queryKeys from '@/utils/query-keys';
import { getSingleReliefFAQ } from '@/services/private/relief/faq';
import ReliefFAQForm from '@/components/relief/faq/ReliefFAQForm';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleReliefFAQ({ id: params.id }),
    queryKey: [queryKeys.reliefFaqs, params.id],
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
      <PageHeader title="Edit Relief FAQ">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <ReliefFAQForm selected={response?.data?.data} />
    </div>
  );
};

export default Page;
