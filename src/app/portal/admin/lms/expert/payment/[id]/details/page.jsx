'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import ExpertPaymentDetails from '@/components/lms/expert/ExpertPaymentDetails';
import { getSingleExpertPayment } from '@/services/private/lms/expert-payment';
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
    queryFn: () => getSingleExpertPayment({ id: params.id }),
    queryKey: [queryKeys.expertPayments, params.id],
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
      <PageHeader title="Payment Details">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <ExpertPaymentDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
