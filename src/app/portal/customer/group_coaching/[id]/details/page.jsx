'use client';
import { PageHeader } from '@/components/common/page';
import { GroupCoachingDetails } from '@/components/common/groupCoaching/GroupCoachingDetailsPage';

const Page = () => {
  return (
    <div>
      <PageHeader title="Group Coaching Details" />
      <GroupCoachingDetails isCustomerView={true} />
    </div>
  );
};

export default Page;
