'use client';
import { PageHeader } from '@/components/common/page';
import Button from '@/components/common/Button';
import AudioSessionDetails from '@/components/lms/session/audio/customer/AudioSessionDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Audio Session Details">
        <Button>Mark As Done</Button>
      </PageHeader>
      <AudioSessionDetails />
    </div>
  );
};

export default Page;
