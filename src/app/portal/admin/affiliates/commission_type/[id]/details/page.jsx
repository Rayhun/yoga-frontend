'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import queryKeys from '@/utils/query-keys';
import { getCommissionTypeDetails } from '@/services/private/affiliates/commission';
import CommissionTypeDetails from '@/components/affiliates/CommissionTypes/ComissionTypeDetails';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();
  
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getCommissionTypeDetails({ id: params.id }),
    queryKey: [queryKeys.commissionTypeList, params.id],
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
      <PageHeader title="Commission Type Details">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <CommissionTypeDetails data={response?.data} />
    </div>
  );
};

export default Page;