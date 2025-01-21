import CustomerOnboardingQuiz from '@/components/onboarding/customer';

export const metadata = {
  title: 'Customer Onboarding',
};

const Page = () => {
  return (
    <div className="flex justify-center min-h-[calc(100vh-56px)] dark:bg-boxdark-2">
      <CustomerOnboardingQuiz />
    </div>
  );
};

export default Page;
