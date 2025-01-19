'use client';
import { PageHeader } from '@/components/common/page';
import CustomerModuleDetails from '@/components/lms/module/CustomerModuleDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Module Details" />
      <CustomerModuleDetails />
    </div>
  );
};

export default Page;
