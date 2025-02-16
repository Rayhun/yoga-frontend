'use client';
import useAuthContext from '@/hooks/useAuthContext';
import { DetailsLayoutWrapper } from '@/components/common/details';
import { PageHeader } from '@/components/common/page';
import UserProfileDetails from '@/components/common/user/UserProfileDetails';

const Page = () => {
  const {
    user: { profile: userProfile },
  } = useAuthContext();

  return (
    <div>
      <PageHeader title="My Profile" />
      <DetailsLayoutWrapper title="Profile">
        <UserProfileDetails data={userProfile} />
      </DetailsLayoutWrapper>
    </div>
  );
};

export default Page;
