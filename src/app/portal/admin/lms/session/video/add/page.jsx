import { PageHeader } from '@/components/common/page';
import VideoSessionForm from '@/components/lms/session/video/VideoSessionForm';

export const metadata = {
  title: 'Add Video Session',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add Video Session" />
      <VideoSessionForm />
    </div>
  );
};

export default Page;
