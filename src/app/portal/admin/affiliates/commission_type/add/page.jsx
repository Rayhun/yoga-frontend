import CommissionTypeForm from '@/components/affiliates/CommissionTypes/CommissionTypeForm';
import { PageHeader } from '@/components/common/page';

export const metadata = {
  title: 'Add New Commission Type',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Commission Type" />
      <CommissionTypeForm />
    </div>
  );
};

export default Page;