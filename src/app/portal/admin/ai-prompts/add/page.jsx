import AIChatPromptsForm from '@/components/AIChatPrompts/AIChatPromptForm';
import { PageHeader } from '@/components/common/page';

export const metadata = {
  title: 'Add AI Chat Prompts',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add AI Chat Prompt" />
      <AIChatPromptsForm />
    </div>
  );
};

export default Page;
