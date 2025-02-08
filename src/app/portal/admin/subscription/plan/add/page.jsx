import { PageHeader } from '@/components/common/page';
import SubscriptionPlanForm from '@/components/subscription/plan/SubscriptionPlanForm';

export const metadata = {
  title: 'Add New Subscription Plan',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Subscription Plan" />
      <SubscriptionPlanForm />
    </div>
  );
};

export default Page;
