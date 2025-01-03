import { PageHeader } from '@/components/common/page';
import ImageSessionForm from '@/components/lms/session/image/ImageSessionForm';

export const metadata = {
  title: 'Add New Image Session',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Image Session" />
      <ImageSessionForm />
    </div>
  );
};

export default Page;
