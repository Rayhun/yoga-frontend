'use client';
import { PageHeader } from '@/components/common/page';
import CustomerImageSessionDetails from '@/components/lms/session/image/CustomerImageSessionDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Image Session Details" />
      <CustomerImageSessionDetails />
    </div>
  );
};

export default Page;
