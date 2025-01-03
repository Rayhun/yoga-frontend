import Chip from '@mui/material/Chip';
import { DetailsLayoutWrapper, DetailsRecord, MultiValueDetailsRecord } from '@/components/common/details';

const LMSQuizDetails = ({ data = {} }) => {
  return (
    <DetailsLayoutWrapper title="Quiz">
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Quiz Number">{data.quiz_number}</DetailsRecord>
        <DetailsRecord label="Explanation">{data.explanation}</DetailsRecord>
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
      </div>
    </DetailsLayoutWrapper>
  );
};

export default LMSQuizDetails;
