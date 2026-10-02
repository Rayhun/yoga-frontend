import { PageHeader } from '@/components/common/page';
import ReliefQuickToolForm from '@/components/relief/quick-tools/ReliefQuickToolForm';

export const metadata = {
  title: 'Add Relief Quick Tool',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add Relief Quick Tool" />
      <ReliefQuickToolForm />
    </div>
  );
};

export default Page;
