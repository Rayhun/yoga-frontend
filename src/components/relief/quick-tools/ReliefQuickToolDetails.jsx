'use client';

import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';
import { getGuidedContentTypeLabel } from '@/utils/relief-quick-tools';

const ReliefQuickToolDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper
      title="Relief Quick Tool"
      onEdit={() => router.push(`/portal/admin/relief/quick-tools/${data?.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data?.title}</DetailsRecord>
        <DetailsRecord label="Slug">{data?.slug}</DetailsRecord>
        <DetailsRecord label="Subtitle">{data?.subtitle || '—'}</DetailsRecord>
        <DetailsRecord label="Icon">{data?.icon}</DetailsRecord>
        <DetailsRecord label="Category Label">{data?.category_label || '—'}</DetailsRecord>
        <DetailsRecord label="Tags">
          {data?.tags?.length ? data.tags.map(tag => tag.label).join(', ') : 'No tags'}
        </DetailsRecord>
        <DetailsRecord label="Content Source">
          {data?.guided_content_source === 'session' ? 'Session' : 'Custom Content'}
        </DetailsRecord>
        <DetailsRecord label="Guided Session">
          {data?.guided_session_id ? `Session #${data.guided_session_id}` : '—'}
        </DetailsRecord>
        <DetailsRecord label="Guided Content Type">
          {getGuidedContentTypeLabel(data?.guided_content_type)}
        </DetailsRecord>
        <DetailsRecord label="Guided Content Link">
          {data?.guided_content_link ? (
            <a
              href={data.guided_content_link}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {data.guided_content_link}
            </a>
          ) : (
            '—'
          )}
        </DetailsRecord>
        <DetailsRecord label="Active">{data?.is_active ? 'Yes' : 'No'}</DetailsRecord>
        <DetailsRecord label="Sections">
          {data?.sections?.length
            ? data.sections.map(section => `${section.section_id} (${section.card_type})`).join(', ')
            : 'No sections'}
        </DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default ReliefQuickToolDetails;
