'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import LMSQuizDetails from '@/components/lms/quiz/customer/LMSQuizDetails';
import { getSingleQuiz } from '@/services/private/customer/quiz';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const quizID = params.id;
  const {
    data: quizResponse,
    isLoading: isLoadingQuizDetails,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleQuiz({ id: quizID }),
    queryKey: [queryKeys.customerQuizes, quizID],
  });

  useHandleApiResponse(failureReason);

  if (isLoadingQuizDetails) return <PageLoader />;

  const quizDetails = quizResponse?.data?.data || {};

  return (
    <div>
      <PageHeader title="Quiz Details" />
      <LMSQuizDetails data={quizDetails} />
    </div>
  );
};

export default Page;
