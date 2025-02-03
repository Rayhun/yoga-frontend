'use client';
import { PageHeader } from '@/components/common/page';
import Button from '@/components/common/Button';
import VideoSessionDetails from '@/components/lms/session/video/customer/VideoSessionDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Video Session Details">
        <Button>Mark As Done</Button>
      </PageHeader>
      <VideoSessionDetails />
    </div>
  );
};

export default Page;
