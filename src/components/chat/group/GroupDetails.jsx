import { DetailsLayoutWrapper, DetailsRecord, MultiValueDetailsRecord } from '@/components/common/details';

const GroupDetails = ({ data = {} }) => {
  return (
    <DetailsLayoutWrapper title="Group">
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Name">{data.group_name}</DetailsRecord>
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
