'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import QuizPageDetails from '@/components/onboarding/quiz-page/admin/QuizPageDetails';
import { getSingleQuizPage } from '@/services/private/onboarding/quiz-page';
import queryKeys from '@/utils/query-keys';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleQuizPage({ id: params.id }),
    queryKey: [queryKeys.onboardingQuizPages, params.id],
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
      <PageHeader title="Quiz Page Details">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <QuizPageDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
