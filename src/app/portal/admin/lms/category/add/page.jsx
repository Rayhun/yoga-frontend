import { PageHeader } from '@/components/common/page';
import CategoryForm from '@/components/lms/category/CategoryForm';

export const metadata = {
  title: 'Add New Category',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Category" />
      <CategoryForm />
    </div>
  );
};

export default Page;
