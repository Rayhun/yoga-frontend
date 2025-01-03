import { PageHeader } from '@/components/common/page';
import ImageSessionForm from '@/components/lms/session/image/ImageSessionForm';

export const metadata = {
  title: 'Add Image Session',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add Image Session" />
      <ImageSessionForm />
    </div>
  );
};

export default Page;
