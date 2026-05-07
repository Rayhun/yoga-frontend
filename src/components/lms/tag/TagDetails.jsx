'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const TagDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper title="Tag" onEdit={() => router.push(`/portal/admin/lms/tag/${data.id}/edit`)}>
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Namespace">{data.namespace || '-'}</DetailsRecord>
        <DetailsRecord label="Canonical Tag">{data.canonical_tag || '-'}</DetailsRecord>
        <DetailsRecord label="Label">{data.label || '-'}</DetailsRecord>
        <DetailsRecord label="Alias">{data.alias || '-'}</DetailsRecord>
        <DetailsRecord label="Status">{data.is_active ? 'Active' : 'Inactive'}</DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default TagDetails;
