'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord, MultiValueDetailsRecord, RelifeIndexBadge } from '@/components/common/details';
import DetailsFileCard from '@/components/common/details/DetailsFileCard';
import { getCatalogTagChipLabel } from '@/utils/catalogTag';
import {
  SESSION_CATALOG_FIELD_NAMESPACES,
  filterSessionTagsByNamespace,
} from '@/utils/sessionCatalogTags';

const VideoSessionDetails = ({ data = {} }) => {
  const router = useRouter();
  const focusAreaTags = filterSessionTagsByNamespace(
    data.tags,
    SESSION_CATALOG_FIELD_NAMESPACES.focus_areas
  );
  const languageTags = filterSessionTagsByNamespace(
    data.tags,
    SESSION_CATALOG_FIELD_NAMESPACES.languages
  );
  const categoryTags = filterSessionTagsByNamespace(
    data.tags,
    SESSION_CATALOG_FIELD_NAMESPACES.categories
  );
  const cultureExperienceTags = filterSessionTagsByNamespace(
    data.tags,
    SESSION_CATALOG_FIELD_NAMESPACES.culture_experience
  );
  return (
    <DetailsLayoutWrapper
      title="Video Session"
      onEdit={() => router.push(`/portal/admin/lms/session/video/${data.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Description">{data.description}</DetailsRecord>
        <DetailsRecord label="Duration">{data.duration}</DetailsRecord>
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
        <DetailsRecord label="Video File">
          <DetailsFileCard fileURL={data.content_file} />
        </DetailsRecord>
        <DetailsRecord label="Audio File">
          <DetailsFileCard fileURL={data.audio_file} />
        </DetailsRecord>
        <DetailsRecord label="Thumbnail">
          <DetailsFileCard fileURL={data.thumbnail_image} isImage />
        </DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default VideoSessionDetails;
