import { PageHeader } from '@/components/common/page';
import OnboardingQuizForm from '@/components/onboarding/quiz/OnboardingQuizForm';

export const metadata = {
  title: 'Add New Quiz',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Quiz" />
      <OnboardingQuizForm />
    </div>
  );
};

export default Page;
