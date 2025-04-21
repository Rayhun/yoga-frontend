import SubscriptionStatus from '@/components/subscription/common/SubscriptionStatus';

export const metadata = {
  title: 'Payment Error',
};

const Page = () => {
  return <SubscriptionStatus variant="error" />;
};

export default Page;
