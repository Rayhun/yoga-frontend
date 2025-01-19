'use client';
import { PageHeader } from '@/components/common/page';
import CustomerAudioSessionDetails from '@/components/lms/session/audio/CustomerAudioSessionDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Audio Session Details" />
      <CustomerAudioSessionDetails />
    </div>
  );
};

export default Page;
