import { PageHeader } from '@/components/common/page';
import ExpertForm from '@/components/lms/experts/ExpertForm';

export const metadata = {
  title: 'Add New Expert',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Expert" />
      <ExpertForm />
    </div>
  );
};

export default Page;
