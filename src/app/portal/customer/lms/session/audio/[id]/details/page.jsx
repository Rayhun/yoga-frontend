'use client';
import { PageHeader } from '@/components/common/page';
import AudioSessionDetails from '@/components/lms/session/audio/customer/AudioSessionDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Audio Session Details" />
      <AudioSessionDetails />
    </div>
  );
};

export default Page;
