'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import ExpertProfileForm from '@/components/lms/expert/ExpertProfileForm';
import { getSingleExpert } from '@/services/private/lms/expert';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleExpert({ id: params.id }),
    queryKey: [queryKeys.lmsExperts, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Edit Expert" />
      <ExpertProfileForm selected={response?.data?.data} isAdminContext={true} />
    </div>
  );
};

export default Page;
