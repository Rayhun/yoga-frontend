'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord, MultiValueDetailsRecord } from '@/components/common/details';
import DetailsFileCard from '@/components/common/details/DetailsFileCard';
import { BasicTable } from '@/components/common/table';

const ModuleDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper
      title="Module"
      onEdit={() => router.push(`/portal/admin/lms/module/${data.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Description">{data.description}</DetailsRecord>
        <DetailsRecord label="Benefits">
          <ol className="list-tick list-inside grid grid-cols-2 gap-2 dark:text-white">
            {data?.benefits?.map(benefit => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ol>
        </DetailsRecord>
        <DetailsRecord label="Status">{data.status}</DetailsRecord>
        <DetailsRecord label="File">
          <DetailsFileCard fileURL={data.image} isImage />
        </DetailsRecord>
        <DetailsRecord label="Access Setting">{data.access_setting}</DetailsRecord>
        <DetailsRecord label="Visibility Setting">{data.visibility_setting}</DetailsRecord>
        <MultiValueDetailsRecord label="Categories" data={data.categories} getChipLabel={i => i.name} />
        <MultiValueDetailsRecord label="Tags" data={data.tags} getChipLabel={i => i.name} />
        <DetailsRecord label="Content">
          <BasicTable
            columns={[
              {
                header: 'Content Type',
                accessorKey: 'content_type',
              },
              {
                header: 'Content',
                accessorKey: 'content_id',
              },
            ]}
            data={data.module}
            showHeader={false}
            showFooter={false}
          />
        </DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default ModuleDetails;
