'use client';
import { PageHeader } from '@/components/common/page';
import { EditExpertGroupCoaching } from '@/components/expert/editGroupCoaching';

const Page = () => {
  return (
    <div>
      <PageHeader title="Edit Group Coaching" />
      <EditExpertGroupCoaching />
    </div>
  );
};

export default Page;
