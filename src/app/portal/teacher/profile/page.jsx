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
  const onEdit = () => router.push('/portal/teacher/editProfile');
  return (
    <div className='relative'>
      <button
        className="absolute right-0 top-0 inline-flex items-center justify-center rounded-md bg-primary px-4 py-1 text-sm text-center font-medium text-white hover:bg-opacity-90"
        onClick={onEdit}
      >
        Edit
      </button>
      {/* <PageHeader title="Expert Profile" /> */}
      {/* <DetailsLayoutWrapper title="Expert Profile Details" onEdit={() => router.push('/portal/teacher/editProfile')}> */}
      <UserProfileDetails data={expertData} />
      {/* </DetailsLayoutWrapper> */}
    </div>
  );
};

export default Page;
