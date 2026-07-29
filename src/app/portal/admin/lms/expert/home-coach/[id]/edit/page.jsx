'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import HomeCoachForm from '@/components/lms/expert/HomeCoachForm';
import { getSingleHomeCoachConfig } from '@/services/private/lms/home-coach';
import queryKeys from '@/utils/query-keys';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleHomeCoachConfig({ id: params.id }),
    queryKey: [queryKeys.homeCoachConfigs, params.id],
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
      <PageHeader title="Edit Home Coach Configuration">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <HomeCoachForm selected={response?.data?.data} />
    </div>
  );
};

export default Page;
