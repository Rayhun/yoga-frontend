import SubscriptionPlansList from '@/components/subscription/plan/SubscriptionPlansList';

export const metadata = {
  title: 'Subscription Plans',
};

const Page = () => {
  return (
    <div>
      <SubscriptionPlansList />
    </div>
  );
};

export default Page;
