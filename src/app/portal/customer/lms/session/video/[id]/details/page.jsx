'use client';
import { PageHeader } from '@/components/common/page';
import VideoSessionDetails from '@/components/lms/session/video/customer/VideoSessionDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Video Session Details" />
      <VideoSessionDetails />
    </div>
  );
};

export default Page;
