'use client';
import { PageHeader } from '@/components/common/page';
import { ExpertGroupCoachingDetails } from '@/components/expert/groupCoachingDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Group Coaching Details" />
      <ExpertGroupCoachingDetails />
    </div>
  );
};

export default Page;
