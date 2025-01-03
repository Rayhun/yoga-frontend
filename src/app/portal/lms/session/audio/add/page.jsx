import { PageHeader } from '@/components/common/page';
import AudioSessionForm from '@/components/lms/session/audio/AudioSessionForm';

export const metadata = {
  title: 'Add Audio Session',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add Audio Session" />
      <AudioSessionForm />
    </div>
  );
};

export default Page;
