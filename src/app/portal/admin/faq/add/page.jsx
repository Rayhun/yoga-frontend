import { PageHeader } from '@/components/common/page';
import FrequentlyAskedQuestionForm from '@/components/FAQs/FrequentlyAskedQuestionForm';

export const metadata = {
  title: 'Add New FAQ',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Frequently Asked Question" />
      <FrequentlyAskedQuestionForm />
    </div>
  );
};

export default Page;