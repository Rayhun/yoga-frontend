import { PageHeader } from '@/components/common/page';
import PublicProgramDetails from '@/components/public/programDetails';

const Page = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader title="Program Details" />
      <PublicProgramDetails />
    </div>
  );
};

export default Page;
