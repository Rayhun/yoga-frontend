import { PageHeader } from '@/components/common/page';
import TagForm from '@/components/lms/tag/TagForm';

export const metadata = {
  title: 'Add New Tag',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Tag" />
      <TagForm />
    </div>
  );
};

export default Page;
