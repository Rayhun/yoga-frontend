'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const AIChatPromptDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper
      title="AI Chat Prompt Details"
      onEdit={() => router.push(`/portal/admin/ai-prompts/${data?.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data?.title}</DetailsRecord>
        <DetailsRecord label="Prompt">{data?.prompt}</DetailsRecord>
        <DetailsRecord label="Chat Type">{data?.chat_type}</DetailsRecord>
        <DetailsRecord label="GPT Model">{data?.gpt_model}</DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default AIChatPromptDetails;
