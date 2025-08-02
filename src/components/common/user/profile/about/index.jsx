import Chip from '@mui/material/Chip';
import ControllableText from '@/components/common/details/ControllableText';
import { LANGUAGES } from '@/utils/constants';

const AboutSection = ({ label, children }) => (
  <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-sm">
    <h5 className="font-bold">{label}</h5>
    <div>{children}</div>
  </div>
);

const ProfileChip = ({ label }) => <Chip label={label} className="bg-dark/10 text-dark" />;

const findRelatedLanguages = (languages) => {
  if (!languages || !Array.isArray(languages)) return [];
  
  const normalizedLanguages = languages.flatMap(lang => 
    typeof lang === 'string' ? lang.split(',') : lang
  );
  
  return normalizedLanguages
    .map(lang => LANGUAGES.find(item => item.value === lang))
    .filter(lang => lang !== undefined);
};

const UserProfileAbout = ({ data }) => {
  const relatedLanguages = findRelatedLanguages(data?.languages);
  return (
    <div className="flex flex-col gap-7">
      <AboutSection label="About">
        <ControllableText>{data?.description || 'No description provided'}</ControllableText>
      </AboutSection>
      <AboutSection label="Coaching Areas">
        <div className="flex flex-wrap gap-2">
          {data?.coaching_areas?.map(item => (
            <ProfileChip key={item.id} label={item?.title} />
          ))}
        </div>
      </AboutSection>
      <AboutSection label="Languages">
        <div className="flex flex-wrap gap-2">
          {relatedLanguages?.map((language, index) => (
            <ProfileChip key={index} label={language?.label} />
          ))}
        </div>
      </AboutSection>
      <AboutSection label="Certifications">
        <div className="flex flex-wrap gap-2">
          {data?.certifications?.map((item) => (
            <ProfileChip key={item.id} label={item?.title} />
          ))}
        </div>
      </AboutSection>
      {/* <AboutSection label="My Coaching Content">
        <div className="flex flex-wrap gap-2">
          {data?.coaching_content?.split(',').map((content, index) => (
            <ProfileChip key={index} label={content} />
          ))}
        </div>
      </AboutSection> */}
      <AboutSection label="Experience">
        <p>{`${data?.experience || '0'} ${data?.experience > 1 ? 'years' : 'year'}`}</p>
      </AboutSection>
      <AboutSection label="My Availability">
        <ProfileChip label={data?.available ? 'Available For Coaching' : 'Not Available'} />
      </AboutSection>
    </div>
  );
};

export default UserProfileAbout;
