'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import queryKeys from '@/utils/query-keys';
import CommissionTypeDetails from '@/components/affiliates/CommissionTypes/ComissionTypeDetails';
import { getAIChatPromptDetails } from '@/services/private/ai-prompts';
import AIChatPromptDetails from '@/components/AIChatPrompts/AIChatPromptDetails';

const Page = ({ params }) => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getAIChatPromptDetails({ id: params.id }),
    queryKey: [queryKeys.aiPromptsList, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="AI Chat Prompt Details" />
      <AIChatPromptDetails data={response?.data} />
    </div>
  );
};

export default Page;