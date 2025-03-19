'use client';
import { DetailsLayoutWrapper } from '@/components/common/details';
import { PageHeader } from '@/components/common/page';
import UserProfileDetails from '@/components/common/user/profile';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import { useExpertContext } from '@/hooks/useExpert';

const Page = () => {
  const { expertData, isLoading, failureReason } = useExpertContext();
  const router = useRouter();
  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;
  return (
    <div>
      <PageHeader title="Expert Profile" />
      <DetailsLayoutWrapper title="Expert Profile Details" onEdit={() => router.push('/portal/teacher/editProfile')}>
        <UserProfileDetails data={expertData} />
      </DetailsLayoutWrapper>
    </div>
  );
};

export default Page;
