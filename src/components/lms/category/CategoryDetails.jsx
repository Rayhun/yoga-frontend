'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const CategoryDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper
      title="Category"
      onEdit={() => router.push(`/portal/admin/lms/category/${data.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Name">{data.name}</DetailsRecord>
        <DetailsRecord label="Parent">{data.parent?.name}</DetailsRecord>
        <DetailsRecord label="Featured">{data.is_feature ? 'Yes' : 'No'}</DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default CategoryDetails;
