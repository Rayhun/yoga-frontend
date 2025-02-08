import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const SubscriptionPlanDetails = ({ data = {} }) => {
  return (
    <DetailsLayoutWrapper title="Subscription Plan">
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Name">{data.name}</DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default SubscriptionPlanDetails;
