'use client';
import { PageHeader } from '@/components/common/page';
import GroupCoachingForm from '@/components/common/groupCoaching/GroupCoachingFrom';
const Page = () => {

  return (
    <div>
      <PageHeader title="Host a Workshop, Bootcamp, or Live Group Coaching" />
      <GroupCoachingForm />
    </div>
  );
};

export default Page;