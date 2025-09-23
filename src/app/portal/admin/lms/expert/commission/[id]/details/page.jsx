'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import ExpertCommissionDetails from '@/components/lms/expert/ExpertCommissionDetails';
import { getSingleExpertCommission } from '@/services/private/lms/expert-commission';
import queryKeys from '@/utils/query-keys';
import Button from '@/components/common/Button';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();
  
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleExpertCommission({ id: params.id }),
    queryKey: [queryKeys.expertCommissions, params.id],
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
      <PageHeader title="Commission Details">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <ExpertCommissionDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
