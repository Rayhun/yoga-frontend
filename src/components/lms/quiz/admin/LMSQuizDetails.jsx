'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord, MultiValueDetailsRecord, RelifeIndexBadge } from '@/components/common/details';
import { getCatalogTagChipLabel } from '@/utils/catalogTag';
import {
  CONTENT_CATALOG_FIELD_NAMESPACES,
  filterContentTagsByNamespace,
  getCultureExperienceDisplayData,
} from '@/utils/contentCatalogTags';

const LMSQuizDetails = ({ data = {} }) => {
  const router = useRouter();
  const focusAreaTags = filterContentTagsByNamespace(
    data.tags,
    CONTENT_CATALOG_FIELD_NAMESPACES.focus_areas
  );
  const languageTags = filterContentTagsByNamespace(
    data.tags,
    CONTENT_CATALOG_FIELD_NAMESPACES.languages
  );
  const categoryTags = filterContentTagsByNamespace(
    data.tags,
    CONTENT_CATALOG_FIELD_NAMESPACES.categories
  );
  const cultureExperienceTags = getCultureExperienceDisplayData(data);
  return (
    <DetailsLayoutWrapper title="Quiz" onEdit={() => router.push(`/portal/admin/lms/quiz/${data.id}/edit`)}>
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Quiz Number">{data.quiz_number}</DetailsRecord>
        <DetailsRecord label="Explanation">{data.explanation}</DetailsRecord>
        <DetailsRecord label="Status">{data.status}</DetailsRecord>
        <DetailsRecord label="Difficulty">{data.difficulty}</DetailsRecord>
        <DetailsRecord label="Intensity">{data.intensity}</DetailsRecord>
        <DetailsRecord label="Access Setting">{data.access_setting}</DetailsRecord>
        <DetailsRecord label="Visibility Setting">{data.visibility_setting}</DetailsRecord>
        <DetailsRecord label="Relife index">
          <RelifeIndexBadge value={data.relife_index} />
        </DetailsRecord>
        <MultiValueDetailsRecord
          label="Focus & approach?"
          data={focusAreaTags.length ? focusAreaTags : data.focus_areas}
          getChipLabel={item => (typeof item === 'string' ? item : getCatalogTagChipLabel(item))}
        />
        <MultiValueDetailsRecord label="Equipments" data={data.equipments} getChipLabel={i => i} />
        <MultiValueDetailsRecord
          label="Culture Experience"
          data={cultureExperienceTags}
          getChipLabel={getCatalogTagChipLabel}
        />
        <MultiValueDetailsRecord
          label="Languages"
          data={languageTags.length ? languageTags : data.languages}
          getChipLabel={item => (typeof item === 'string' ? item : getCatalogTagChipLabel(item))}
        />
        <MultiValueDetailsRecord
          label="Categories"
          data={categoryTags.length ? categoryTags : data.categories}
          getChipLabel={item =>
            typeof item === 'string' ? item : item?.name ?? getCatalogTagChipLabel(item)
          }
        />
      </div>
    </DetailsLayoutWrapper>
  );
};

export default LMSQuizDetails;
