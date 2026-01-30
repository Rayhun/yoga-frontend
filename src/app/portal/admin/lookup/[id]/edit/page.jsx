'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import queryKeys from '@/utils/query-keys';
import { getSingleLookupItem } from '@/services/private/lms/lookup-item';
import LookupItemForm from '@/components/lms/lookup-item/LookupItemForm';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();
  
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleLookupItem({ id: params.id }),
    queryKey: [queryKeys.lookupItems, params.id],
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
      <PageHeader title="Edit Lookup Item">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <LookupItemForm selected={response?.data?.data} />
    </div>
  );
};

export default Page;

