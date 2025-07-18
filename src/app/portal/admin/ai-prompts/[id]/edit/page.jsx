'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import queryKeys from '@/utils/query-keys';
import CommissionTypeForm from '@/components/affiliates/CommissionTypes/CommissionTypeForm';
import { getAIChatPromptDetails } from '@/services/private/ai-prompts';
import AIChatPromptsForm from '@/components/AIChatPrompts/AIChatPromptForm';

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
      <PageHeader title="Edit AI Chat Prompt" />
      <AIChatPromptsForm selected={response?.data} />
    </div>
  );
};

export default Page;
