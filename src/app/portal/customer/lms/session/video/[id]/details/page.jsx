'use client';
import { PageHeader } from '@/components/common/page';
import CustomerVideoSessionDetails from '@/components/lms/session/video/CustomerVideoSessionDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Video Session Details" />
      <CustomerVideoSessionDetails />
    </div>
  );
};

export default Page;
