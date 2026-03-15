import { PageHeader } from '@/components/common/page';
import PublicGroupCoachingDetails from '@/components/public/groupCoachingDetails';

const Page = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader title="Group Coaching Details" />
      <PublicGroupCoachingDetails />
    </div>
  );
};

export default Page;
