import { DetailsLayoutWrapper, DetailsRecord, MultiValueDetailsRecord } from '@/components/common/details';

const TagDetails = ({ data = {} }) => {
  return (
    <DetailsLayoutWrapper title="Tag">
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Name">{data.name}</DetailsRecord>
        <MultiValueDetailsRecord label="Categories" data={data.category} getChipLabel={i => i.name} />
      </div>
    </DetailsLayoutWrapper>
  );
};

export default TagDetails;
