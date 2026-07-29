'use client';
import AuthProvider from '@/context/AuthProvider';
import CustomerOnboardingQuiz from '@/components/onboarding/customer';
import OnboardingPageGuard from '@/components/onboarding/OnboardingPageGuard';

const Page = () => {
  return (
    <AuthProvider>
      <OnboardingPageGuard>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <CustomerOnboardingQuiz />
        </div>
      </OnboardingPageGuard>
    </AuthProvider>
  );
};

export default Page;
