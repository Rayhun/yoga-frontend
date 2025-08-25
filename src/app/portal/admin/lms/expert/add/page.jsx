import { PageHeader } from '@/components/common/page';
import ExpertProfileForm from '@/components/lms/expert/ExpertProfileForm';

export const metadata = {
  title: 'Add New Expert',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Expert" />
      <ExpertProfileForm isAdminContext={true} />
    </div>
  );
};

export default Page;
