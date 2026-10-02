import { PageHeader } from '@/components/common/page';
import ReliefFAQForm from '@/components/relief/faq/ReliefFAQForm';

export const metadata = {
  title: 'Add Relief FAQ',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add Relief FAQ" />
      <ReliefFAQForm />
    </div>
  );
};

export default Page;
