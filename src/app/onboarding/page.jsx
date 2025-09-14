import CustomerOnboardingQuiz from '@/components/onboarding/customer';
import OnboardingPageGuard from '@/components/onboarding/OnboardingPageGuard';

export const metadata = {
  title: 'Customer Onboarding',
};

const Page = () => {
  return (
    <OnboardingPageGuard>
      <div className="flex justify-center min-h-[calc(100vh-56px)] dark:bg-boxdark-2">
        <CustomerOnboardingQuiz />
      </div>
    </OnboardingPageGuard>
  );
};

export default Page;
