'use client';
import { PageHeader } from '@/components/common/page';
import ImageSessionDetails from '@/components/lms/session/image/customer/ImageSessionDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Image Session Details" />
      <ImageSessionDetails />
    </div>
  );
};

export default Page;
