'use client';
import useAuthContext from '@/hooks/useAuthContext';
import { DetailsLayoutWrapper } from '@/components/common/details';
import { PageHeader } from '@/components/common/page';
import UserProfileDetails from '@/components/common/user/profile';

const Page = () => {
  const {
    user: { profile: userProfile },
  } = useAuthContext();

  return (
    <div>
      <PageHeader title="User Profile" />
      <DetailsLayoutWrapper title="Profile Details">
        <UserProfileDetails data={userProfile} />
      </DetailsLayoutWrapper>
    </div>
  );
};

export default Page;
