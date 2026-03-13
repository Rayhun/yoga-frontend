'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import queryKeys from '@/utils/query-keys';
import CommissionTypeDetails from '@/components/affiliates/CommissionTypes/ComissionTypeDetails';
import { getAIChatPromptDetails } from '@/services/private/ai-prompts';
import AIChatPromptDetails from '@/components/AIChatPrompts/AIChatPromptDetails';
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
      <PageHeader title="AI Chat Prompt Details">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <AIChatPromptDetails data={response?.data} />
      <PageHeader title="AI Chat Prompt Details" />
      <AIChatPromptDetails data={response?.data?.data} />
    </div>
  );
};

export default Page;
