'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';
import ControllableRichText from '@/components/common/details/ControllableRichText';
import { getCatalogTagChipLabel } from '@/utils/catalogTag';

const ReliefFAQDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper
      title="Relief FAQ"
      onEdit={() => router.push(`/portal/admin/relief/faq/${data?.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Category">{data?.category || '—'}</DetailsRecord>
        <DetailsRecord label="Icon">{data?.icon}</DetailsRecord>
        <DetailsRecord label="Question">{data?.question}</DetailsRecord>
        <DetailsRecord label="Answer">
          <ControllableRichText>{data?.answer || 'No answer provided'}</ControllableRichText>
        </DetailsRecord>
        <DetailsRecord label="Slug">{data?.slug || '—'}</DetailsRecord>
        <DetailsRecord label="Active">{data?.is_active ? 'Yes' : 'No'}</DetailsRecord>
        <DetailsRecord label="Tags">
          {data?.tags?.length
            ? data.tags.map(tag => getCatalogTagChipLabel(tag)).join(', ')
            : 'No tags'}
        </DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default ReliefFAQDetails;
