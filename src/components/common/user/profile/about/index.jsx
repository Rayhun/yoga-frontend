import Chip from '@mui/material/Chip';
import ControllableText from '@/components/common/details/ControllableText';

const AboutSection = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <h5 className="font-bold">{label}</h5>
    <div>{children}</div>
  </div>
);

const ProfileChip = ({ label }) => <Chip label={label} className="bg-primary/10 text-primary" />;

const UserProfileAbout = () => {
  return (
    <div className="flex flex-col gap-7">
      <AboutSection label="Coaching Areas">
        <div className="flex flex-wrap gap-2">
          <ProfileChip label="Cosmetics Acupuncture" />
        </div>
      </AboutSection>
      <AboutSection label="About">
        <ControllableText>
          There are many variations of passages of Lorem Ipsum available, but the majority have suffered
          alteration in some form, by injected humour, or randomised words which do not look even slightly
          believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there is not
          anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet
          tend to repeat predefined chunks as necessary, making this the first true generator on the Internet.
          It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures,
          to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free
          from repetition, injected humour, or non-characteristic words etc.
        </ControllableText>
      </AboutSection>
      <AboutSection label="Languages">
        <div className="flex flex-wrap gap-2">
          <ProfileChip label="English" />
          <ProfileChip label="Spanish" />
          <ProfileChip label="French" />
        </div>
      </AboutSection>
      <AboutSection label="Credentials">
        <p>Certified Life Coach, Master in Pyschology, Wellness Expert</p>
      </AboutSection>
      <AboutSection label="My Availability">
        <Chip color="success" label="Available For Coaching" />
      </AboutSection>
      <AboutSection label="My Coaching Content">
        <p>Cosmetics Acupuncture</p>
      </AboutSection>
    </div>
  );
};

export default UserProfileAbout;
