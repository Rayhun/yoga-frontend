'use client';
import { PageHeader } from '@/components/common/page';
import ModuleDetails from '@/components/lms/module/customer/ModuleDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Module Details" />
      <ModuleDetails />
    </div>
  );
};

export default Page;
