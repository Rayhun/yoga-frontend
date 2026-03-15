'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import queryKeys from '@/utils/query-keys';
import CommissionTypeForm from '@/components/affiliates/CommissionTypes/CommissionTypeForm';
import { getAIChatPromptDetails } from '@/services/private/ai-prompts';
import AIChatPromptsForm from '@/components/AIChatPrompts/AIChatPromptForm';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();
  
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
      <PageHeader title="Edit AI Chat Prompt">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <AIChatPromptsForm selected={response?.data} />
      <PageHeader title="Edit AI Chat Prompt" />
      <AIChatPromptsForm selected={response?.data?.data} />
    </div>
  );
};

export default Page;
