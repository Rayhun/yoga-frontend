'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';
import ControllableRichText from '@/components/common/details/ControllableRichText';

const SubscriptionPageDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper
      title="Subscription Page"
      onEdit={() => router.push(`/portal/admin/subscription/page/${data.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Slug">{data.slug}</DetailsRecord>
        <DetailsRecord label="Description">
          <ControllableRichText>{data.description || 'No description provided'}</ControllableRichText>
        </DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default SubscriptionPageDetails;
