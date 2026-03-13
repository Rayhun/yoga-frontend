'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import queryKeys from '@/utils/query-keys';
import FrequentlyAskedQuestionDetails from '@/components/FAQs/FrequentlyAskedQuestionDetails';
import { getSingleQuestion } from '@/services/private/faqs';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();
  
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleQuestion({ id: params.id }),
    queryKey: [queryKeys.frequentlyAskedQuestions, params.id],
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
      <PageHeader title="Frequently Asked Question Details">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <FrequentlyAskedQuestionDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
