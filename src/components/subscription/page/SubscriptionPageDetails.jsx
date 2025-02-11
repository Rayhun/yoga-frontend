import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const SubscriptionPageDetails = ({ data = {} }) => {
  return (
    <DetailsLayoutWrapper title="Subscription Page">
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Slug">{data.slug}</DetailsRecord>
        <DetailsRecord label="Description">{data.description}</DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default SubscriptionPageDetails;
