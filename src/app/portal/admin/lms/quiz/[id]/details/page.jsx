'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import LMSQuizDetails from '@/components/lms/quiz/admin/LMSQuizDetails';
import { getSingleQuiz } from '@/services/private/lms/quiz';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleQuiz({ id: params.id }),
    queryKey: [queryKeys.lmsQuizes, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Quiz Details" />
      <LMSQuizDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
