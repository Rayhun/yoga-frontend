'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import OnboardingQuizForm from '@/components/onboarding/quiz/OnboardingQuizForm';
import { getSingleQuiz } from '@/services/private/onboarding/quiz';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleQuiz({ id: params.id }),
    queryKey: [queryKeys.onboardingQuiz, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Edit Quiz" />
      <OnboardingQuizForm selected={response?.data?.data} />
    </div>
  );
};

export default Page;
