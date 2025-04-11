'use client';
import React from 'react'
import UserProfileDetails from '@/components/expert/profile';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import { useExpertContext } from '@/hooks/useExpert';
import { RiEdit2Line } from "react-icons/ri";

const Page = () => {
  const { expertData, isLoading, failureReason } = useExpertContext();
  const router = useRouter();
  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;
  const onEdit = () => router.push('/portal/teacher/editProfile');
  return (
    <div className='relative'>
      <button
        className="absolute right-6 top-3 inline-flex items-center justify-center text-primary  text-sm text-center font-medium hover:underline"
        onClick={onEdit}
      >
        <RiEdit2Line />
        Edit Profile
      </button>
      {/* <PageHeader title="Expert Profile" /> */}
      {/* <DetailsLayoutWrapper title="Expert Profile Details" onEdit={() => router.push('/portal/teacher/editProfile')}> */}
      <UserProfileDetails data={expertData} />
      {/* </DetailsLayoutWrapper> */}
    </div>
  );
};

export default Page;
