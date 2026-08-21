'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import ExpertDetails from '@/components/lms/expert/ExpertDetails';
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
      <ExpertDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
