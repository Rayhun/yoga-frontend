import Chip from '@mui/material/Chip';
import ControllableRichText from '@/components/common/details/ControllableRichText';
import { getCoachingAreaLabel, getLanguageDisplayLabels } from '@/utils/expertProfileTags';
import { 
  FiUser, 
  FiTarget, 
  FiGlobe, 
  FiAward, 
  FiBriefcase, 
  FiCheckCircle 
} from 'react-icons/fi';
import { LuBriefcaseBusiness } from 'react-icons/lu';
import BusinessProfileCard from './BusinessProfileCard';

const AboutSection = ({ label, children, icon: Icon }) => (
  <div className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-green-400 rounded-l-xl"></div>
    <div className="flex items-start gap-3 mb-4">
      {Icon && (
        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      )}
      <h5 className="text-lg font-bold text-gray-900 dark:text-white pt-1.5">{label}</h5>
    </div>
    <div className="text-gray-700 dark:text-gray-300">{children}</div>
  </div>
);

const ProfileChip = ({ label }) => (
  <Chip 
    label={label} 
    className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30 font-medium hover:shadow-sm transition-all duration-200" 
  />
);

const UserProfileAbout = ({ data, isExpertView = false, showFullAboutText = false, disableLinks = false }) => {
  const languageLabels = getLanguageDisplayLabels(data?.languages);
  return (
    <div className="flex flex-col gap-5">
      <AboutSection label="About" icon={FiUser}>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ControllableRichText showFullText={showFullAboutText} disableLinks={disableLinks}>
            {data?.description || 'No description provided'}
          </ControllableRichText>
        </div>
      </AboutSection>

      {(data?.business_name || data?.business_logo) && (
        <AboutSection label="Business" icon={LuBriefcaseBusiness}>
          <BusinessProfileCard businessName={data?.business_name} businessLogo={data?.business_logo} />
        </AboutSection>
      )}

      {data?.coaching_areas && data.coaching_areas.length > 0 && (
        <AboutSection label="Coaching Areas" icon={FiTarget}>
          <div className="flex flex-wrap gap-2.5">
            {data.coaching_areas.map(item => (
              <ProfileChip key={item.id} label={getCoachingAreaLabel(item)} />
            ))}
          </div>
        </AboutSection>
      )}

      {languageLabels.length > 0 && (
        <AboutSection label="Languages" icon={FiGlobe}>
          <div className="flex flex-wrap gap-2.5">
            {languageLabels.map((language, index) => (
              <ProfileChip key={index} label={language} />
            ))}
          </div>
        </AboutSection>
      )}

      {data?.certifications && data.certifications.length > 0 && (
        <AboutSection label="Certifications" icon={FiAward}>
          <div className="flex flex-wrap gap-2.5">
            {data.certifications.map((item) => (
              <ProfileChip key={item.id} label={item?.title} />
            ))}
          </div>
        </AboutSection>
      )}

      {data?.experience !== undefined && data.experience !== null && (
        <AboutSection label="Experience" icon={FiBriefcase}>
          <p className="text-base font-medium text-gray-900 dark:text-white">
            {`${data.experience || '0'} ${data.experience > 1 ? 'years' : 'year'} of experience`}
          </p>
        </AboutSection>
      )}

      <AboutSection label={isExpertView ? "My Availability" : "Availability"} icon={FiCheckCircle}>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${data?.available ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
          <ProfileChip 
            label={data?.available ? 'Available For Coaching' : 'Not Available'} 
          />
        </div>
      </AboutSection>
    </div>
  );
};

export default UserProfileAbout;
