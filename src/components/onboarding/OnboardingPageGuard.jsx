'use client';
import { useRouter } from 'next/navigation';
import useAuthContext from '@/hooks/useAuthContext';
import PageLoader from '@/components/common/loader/PageLoader';
import Button from '@/components/common/Button';

const OnboardingPageGuard = ({ children }) => {
  const router = useRouter();
  const { user } = useAuthContext();

  const handleGoToHome = () => {
    router.push('/portal');
  };

  // If user is admin, redirect to portal
  if (user?.isAdmin) {
    router.push('/portal');
    return <PageLoader />;
  }

  // If user is customer and has completed onboarding, show message
  if (user?.isCustomer && user?.profile?.on_boarding_quiz === true) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-56px)] dark:bg-boxdark-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Onboarding Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You have already submitted the onboarding quiz. You can now access all features of the platform.
            </p>
          </div>
          <Button onClick={handleGoToHome} className="w-full">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  // If user is customer and hasn't completed onboarding (false, null, or undefined), show the onboarding quiz
  if (user?.isCustomer && user?.profile?.on_boarding_quiz !== true) {
    return children;
  }

  // Default case - show loading
  return <PageLoader />;
};

export default OnboardingPageGuard;
