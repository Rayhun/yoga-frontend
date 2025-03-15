'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord, MultiValueDetailsRecord } from '@/components/common/details';

const TagDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper title="Tag" onEdit={() => router.push(`/portal/admin/lms/tag/${data.id}/edit`)}>
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Name">{data.name}</DetailsRecord>
        <MultiValueDetailsRecord label="Categories" data={data.category} getChipLabel={i => i.name} />
      </div>
    </DetailsLayoutWrapper>
  );
};

export default TagDetails;
