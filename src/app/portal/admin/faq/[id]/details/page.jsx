'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import queryKeys from '@/utils/query-keys';
import FrequentlyAskedQuestionDetails from '@/components/FAQs/FrequentlyAskedQuestionDetails';
import { getSingleQuestion } from '@/services/private/faqs';

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
      <PageHeader title="Frequently Asked Question Details" />
      <FrequentlyAskedQuestionDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
