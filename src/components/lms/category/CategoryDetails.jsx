import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const CategoryDetails = ({ data = {} }) => {
  return (
    <DetailsLayoutWrapper title="Category">
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Name">{data.name}</DetailsRecord>
        <DetailsRecord label="Parent">{data.parent?.name}</DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default CategoryDetails;
