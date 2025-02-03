'use client';
import { PageHeader } from '@/components/common/page';
import Button from '@/components/common/Button';
import ImageSessionDetails from '@/components/lms/session/image/customer/ImageSessionDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Image Session Details">
        <Button>Mark As Done</Button>
      </PageHeader>
      <ImageSessionDetails />
    </div>
  );
};

export default Page;
