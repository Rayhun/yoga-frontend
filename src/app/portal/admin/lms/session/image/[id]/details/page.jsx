'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import ImageSessionDetails from '@/components/lms/session/image/admin/ImageSessionDetails';
import { getSingleSession } from '@/services/private/lms/session';
import queryKeys from '@/utils/query-keys';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();
  
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleSession({ id: params.id }),
    queryKey: [queryKeys.lmsImageSessions, params.id],
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
      <PageHeader title="Image Session Details">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <ImageSessionDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
