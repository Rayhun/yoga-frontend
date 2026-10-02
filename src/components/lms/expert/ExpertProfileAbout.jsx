import Chip from '@mui/material/Chip';
import ControllableRichText from '@/components/common/details/ControllableRichText';
import BusinessProfileCard from '@/components/common/user/profile/about/BusinessProfileCard';
import { getCoachingAreaLabel, getLanguageDisplayLabels } from '@/utils/expertProfileTags';

const AboutSection = ({ label, children }) => (
  <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-sm">
    <h5 className="font-bold">{label}</h5>
    <div>{children}</div>
  </div>
);

const ProfileChip = ({ label }) => <Chip label={label} className="bg-dark/10 text-dark" />;

const ExpertProfileAbout = ({ data }) => {
  const languageLabels = getLanguageDisplayLabels(data?.languages);

  return (
    <div className="flex flex-col gap-7">
      <AboutSection label="About">
        <ControllableRichText showFullText={true} disableLinks>{data?.description || 'No description provided'}</ControllableRichText>
      </AboutSection>
      {(data?.business_name || data?.business_logo) && (
        <AboutSection label="Business">
          <BusinessProfileCard businessName={data?.business_name} businessLogo={data?.business_logo} />
        </AboutSection>
      )}
      <AboutSection label="Coaching Areas">
        <div className="flex flex-wrap gap-2">
          {data?.coaching_areas?.map(item => (
            <ProfileChip key={item.id} label={getCoachingAreaLabel(item)} />
          ))}
        </div>
      </AboutSection>
      <AboutSection label="Languages">
        <div className="flex flex-wrap gap-2">
          {languageLabels.map((language, index) => (
            <ProfileChip key={index} label={language} />
          ))}
        </div>
      </AboutSection>
      <AboutSection label="Certifications">
        <div className="flex flex-wrap gap-2">
          {data?.certifications?.map((item) => (
            <ProfileChip key={item?.id} label={item?.title} />
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
