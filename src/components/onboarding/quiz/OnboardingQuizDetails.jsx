import { DetailsLayoutWrapper, DetailsRecord, MultiValueDetailsRecord } from '@/components/common/details';

const OnboardingQuizDetails = ({ data = {} }) => {
  return (
    <DetailsLayoutWrapper title="Quiz">
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Type">{data.screen_type}</DetailsRecord>
        <DetailsRecord label="Description">{data.description}</DetailsRecord>
        <DetailsRecord label="Is Required">{data.is_required}</DetailsRecord>
        <MultiValueDetailsRecord label="Options" data={data.options} getChipLabel={i => i.text} />
      </div>
    </DetailsLayoutWrapper>
  );
};

export default OnboardingQuizDetails;
