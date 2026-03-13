'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import OnboardingQuizForm from '@/components/onboarding/quiz/OnboardingQuizForm';
import { getSingleQuiz } from '@/services/private/onboarding/quiz';
import queryKeys from '@/utils/query-keys';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();
  
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
      <PageHeader title="Edit Quiz">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <OnboardingQuizForm selected={response?.data?.data} />
    </div>
  );
};

export default Page;
