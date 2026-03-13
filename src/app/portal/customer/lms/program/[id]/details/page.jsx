'use client';
import { PageHeader } from '@/components/common/page';
import ProgramDetails from '@/components/lms/program/customer/ProgramDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Program Details" />
      <ProgramDetails />
    </div>
  );
};

export default Page;
