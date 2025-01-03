'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import { getSingleSession } from '@/services/private/lms/session';
import queryKeys from '@/utils/query-keys';
import ImageSessionDetails from '@/components/lms/session/image/ImageSessionDetails';

const Page = ({ params }) => {
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

  return (
    <div>
      <PageHeader title="Image Session Details" />
      <ImageSessionDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
