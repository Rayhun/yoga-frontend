import CustomerOnboardingQuiz from '@/components/onboarding/customer';

export const metadata = {
  title: 'Onboarding Quiz',
};

const Page = ({ params }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <CustomerOnboardingQuiz pageSlug={params.slug} isPublic />
    </div>
  );
};

export default Page;
