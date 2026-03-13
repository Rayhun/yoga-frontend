import SubscriptionStatus from '@/components/subscription/common/SubscriptionStatus';

export const metadata = {
  title: 'Subscription Error',
};

const Page = () => {
  return <SubscriptionStatus variant="error" />;
};

export default Page;
