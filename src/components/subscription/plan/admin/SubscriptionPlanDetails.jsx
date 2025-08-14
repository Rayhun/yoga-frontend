'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const SubscriptionPlanDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper
      title="Subscription Plan"
      onEdit={() => router.push(`/portal/admin/subscription/plan/${data.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Status">{data.status}</DetailsRecord>
        <DetailsRecord label="Subscription Type">{data.subscription_type}</DetailsRecord>
        <DetailsRecord label="Subscription Tenure">{data.subscription_tenure}</DetailsRecord>
        <DetailsRecord label="Price">{data.price}</DetailsRecord>
        <DetailsRecord label="Discounted Price">{data.discounted_price}</DetailsRecord>
        <DetailsRecord label="Features">{data.features}</DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default SubscriptionPlanDetails;
