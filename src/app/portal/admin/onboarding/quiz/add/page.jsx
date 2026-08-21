import { PageHeader } from '@/components/common/page';
import OnboardingQuizForm from '@/components/onboarding/quiz/OnboardingQuizForm';

export const metadata = {
  title: 'Add onboarding step',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add onboarding step" />
      <OnboardingQuizForm />
    </div>
  );
};

export default Page;
