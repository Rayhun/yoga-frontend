import SubscriptionStatus from '@/components/subscription/common/SubscriptionStatus';

export const metadata = {
  title: 'Payment Cancelled',
};

const Page = () => {
  return <SubscriptionStatus variant="cancel" />;
};

export default Page;
