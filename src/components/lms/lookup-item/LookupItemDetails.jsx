'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const LookupItemDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper
      title="Lookup Item"
      onEdit={() => router.push(`/portal/admin/lookup/${data?.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data?.title}</DetailsRecord>
        <DetailsRecord label="Category">{data?.category}</DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default LookupItemDetails;

