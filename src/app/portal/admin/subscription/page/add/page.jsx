import { PageHeader } from '@/components/common/page';
import SubscriptionPageForm from '@/components/subscription/page/admin/SubscriptionPageForm';

export const metadata = {
  title: 'Add New Subscription Page',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Subscription Page" />
      <SubscriptionPageForm />
    </div>
  );
};

export default Page;
