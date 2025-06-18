'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import queryKeys from '@/utils/query-keys';
import { getSingleQuestion } from '@/services/private/faqs';
import FrequentlyAskedQuestionForm from '@/components/FAQs/FrequentlyAskedQuestionForm';

const Page = ({ params }) => {
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

  return (
    <div>
      <PageHeader title="Edit Frequently Asked Question" />
      <FrequentlyAskedQuestionForm selected={response?.data?.data} />
    </div>
  );
};

export default Page;
