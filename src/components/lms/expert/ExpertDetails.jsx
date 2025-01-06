import Avatar from '@mui/material/Avatar';
import { DetailsLayoutWrapper, DetailsRecord, MultiValueDetailsRecord } from '@/components/common/details';
import DetailsFileCard from '@/components/common/details/DetailsFileCard';

const ExpertDetails = ({ data = {} }) => {
  return (
    <DetailsLayoutWrapper title="Expert">
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Name">{data.name}</DetailsRecord>
        <DetailsRecord label="Email">{data.email}</DetailsRecord>
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Description">{data.description}</DetailsRecord>
        <MultiValueDetailsRecord label="Categories" data={data.categories} getChipLabel={i => i.name} />
        <MultiValueDetailsRecord label="Tags" data={data.tags} getChipLabel={i => i.name} />
        {data.file_link ? (
          <DetailsRecord label="Avatar">
            {/* <Avatar alt={data.name} src={data.file_link} /> */}
            <DetailsFileCard fileURL={data.file_link} />
          </DetailsRecord>
        ) : null}
      </div>
    </DetailsLayoutWrapper>
  );
};

export default ExpertDetails;
