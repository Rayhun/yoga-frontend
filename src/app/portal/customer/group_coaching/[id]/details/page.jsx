'use client';
import { PageHeader } from '@/components/common/page';
import { ExpertGroupCoachingDetails } from '@/components/customer/groupCoachingDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Group Coaching Details" />
      <ExpertGroupCoachingDetails isCustomerView={true} />
    </div>
  );
};

export default Page;
