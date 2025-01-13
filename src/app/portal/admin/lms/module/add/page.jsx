import { PageHeader } from '@/components/common/page';
import ModuleForm from '@/components/lms/module/ModuleForm';

export const metadata = {
  title: 'Add New Module',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Module" />
      <ModuleForm />
    </div>
  );
};

export default Page;
