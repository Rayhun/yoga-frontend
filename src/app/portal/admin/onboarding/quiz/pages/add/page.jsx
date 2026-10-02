import { PageHeader } from '@/components/common/page';
import QuizPageForm from '@/components/onboarding/quiz-page/admin/QuizPageForm';

export const metadata = {
  title: 'Add New Quiz Page',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Quiz Page" />
      <QuizPageForm />
    </div>
  );
};

export default Page;
