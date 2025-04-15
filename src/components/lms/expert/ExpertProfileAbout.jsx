import Chip from '@mui/material/Chip';
import ControllableText from '@/components/common/details/ControllableText';

const AboutSection = ({ label, children }) => (
  <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-sm">
    <h5 className="font-bold">{label}</h5>
    <div>{children}</div>
  </div>
);

const ProfileChip = ({ label }) => <Chip label={label} className="bg-dark/10 text-dark" />;

const ExpertProfileAbout = ({ data }) => {
  return (
    <div className="flex flex-col gap-7">
      <AboutSection label="About">
        <ControllableText>{data?.description || 'No description provided'}</ControllableText>
      </AboutSection>
      <AboutSection label="Coaching Areas">
        <div className="flex flex-wrap gap-2">
          {data?.tags?.map(tag => (
            <ProfileChip key={tag.id} label={tag?.name} />
          ))}
        </div>
      </AboutSection>
      <AboutSection label="Languages">
        <div className="flex flex-wrap gap-2">
          {data?.languages?.[0]?.split(',').map((tag, index) => (
            <ProfileChip key={index} label={tag} />
          ))}
        </div>
      </AboutSection>
      <AboutSection label="Credentials">
        <div className="flex flex-wrap gap-2">
          {data?.credentials?.[0]?.split(',').map((tag, index) => (
            <ProfileChip key={index} label={tag} />
          ))}
        </div>
      </AboutSection>
      <AboutSection label="Coaching Content">
        <div className="flex flex-wrap gap-2">
          {data?.coaching_content?.split(',').map((content, index) => (
            content && <ProfileChip key={index} label={content} />
          ))}
        </div>
      </AboutSection>
      <AboutSection label="Experience">
        <p>{`${data?.experience || '0'} ${data?.experience > 1 ? 'years' : 'year'}`}</p>
      </AboutSection>
      <AboutSection label="Availability">
        <ProfileChip label={data?.available ? 'Available For Coaching' : 'Not Available'} />
      </AboutSection>
    </div>
  );
};

export default ExpertProfileAbout;
