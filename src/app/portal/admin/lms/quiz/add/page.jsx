import { PageHeader } from '@/components/common/page';
import LMSQuizForm from '@/components/lms/quiz/admin/LMSQuizForm';

export const metadata = {
  title: 'Add New Quiz',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Quiz" />
      <LMSQuizForm />
    </div>
  );
};

export default Page;
