import { DetailsLayoutWrapper, DetailsRecord, MultiValueDetailsRecord } from '@/components/common/details';
import DetailsFileCard from '@/components/common/details/DetailsFileCard';

const AudioSessionDetails = ({ data = {} }) => {
  return (
    <DetailsLayoutWrapper title="Audio Session">
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Description">{data.description}</DetailsRecord>
        <DetailsRecord label="Duration">{data.duration}</DetailsRecord>
        <DetailsRecord label="Status">{data.status}</DetailsRecord>
        <DetailsRecord label="Difficulty">{data.difficulty}</DetailsRecord>
        <DetailsRecord label="Intensity">{data.intensity}</DetailsRecord>
        <DetailsRecord label="Access Setting">{data.access_setting}</DetailsRecord>
        <DetailsRecord label="Visibility Setting">{data.visibility_setting}</DetailsRecord>
        <MultiValueDetailsRecord label="Focus Areas" data={data.focus_areas} getChipLabel={i => i} />
        <MultiValueDetailsRecord label="Equipments" data={data.equipments} getChipLabel={i => i} />
        <MultiValueDetailsRecord label="Languages" data={data.languages} getChipLabel={i => i} />
        <MultiValueDetailsRecord label="Categories" data={data.categories} getChipLabel={i => i.name} />
        <MultiValueDetailsRecord label="Tags" data={data.tags} getChipLabel={i => i.name} />
        <DetailsRecord label="Audio File">
          <DetailsFileCard fileURL={data.content_file} />
        </DetailsRecord>
        <DetailsRecord label="Thumbnail">
          <DetailsFileCard fileURL={data.thumbnail_image} isImage />
        </DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default AudioSessionDetails;
