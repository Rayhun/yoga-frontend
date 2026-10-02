'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import OnboardingQuizDetails from '@/components/onboarding/quiz/OnboardingQuizDetails';
import { getOnboardingV2Question } from '@/services/private/onboarding/quiz-v2';
import queryKeys from '@/utils/query-keys';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();
  
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getOnboardingV2Question({ id: params.id }),
    queryKey: [queryKeys.onboardingQuizV2, params.id],
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
      <PageHeader title="Question overview">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <OnboardingQuizDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
