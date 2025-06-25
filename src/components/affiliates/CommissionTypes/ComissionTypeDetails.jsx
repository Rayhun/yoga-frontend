'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const CommissionTypeDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper
      title="Commission Type Details"
      onEdit={() => router.push(`/portal/admin/affiliates/commission_type/${data?.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data?.title}</DetailsRecord>
        <DetailsRecord label="Percentage">{data?.percentage}</DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default CommissionTypeDetails;