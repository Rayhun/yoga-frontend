'use client';
import { PageHeader } from '@/components/common/page';
import CustomerProgramDetails from '@/components/lms/program/CustomerProgramDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Program Details" />
      <CustomerProgramDetails />
    </div>
  );
};

export default Page;
