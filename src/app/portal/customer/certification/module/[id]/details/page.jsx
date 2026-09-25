'use client';
import { PageHeader } from '@/components/common/page';
import ModuleDetails from '@/components/certification/details/ModuleDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Module Details" />
      <ModuleDetails />
    </div>
  );
};

export default Page;
