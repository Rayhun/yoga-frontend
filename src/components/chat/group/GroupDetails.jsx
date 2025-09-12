'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord, MultiValueDetailsRecord } from '@/components/common/details';

const GroupDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper
      title="Group"
      onEdit={() => router.push(`/portal/admin/chat/group/${data.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Name">{data.group_name}</DetailsRecord>
        <DetailsRecord label="Visibility">{data.visibility}</DetailsRecord>
        <MultiValueDetailsRecord
          label="Members"
          data={data.members}
          getChipLabel={i => i.first_name + ' ' + (i.last_name || '')}
        />
      </div>
    </DetailsLayoutWrapper>
  );
};

export default GroupDetails;
