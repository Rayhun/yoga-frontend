'use client';
import React from 'react'
import UserProfileDetails from '@/components/expert/profile';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import { useExpertContext } from '@/hooks/useExpert';
import { RiEdit2Line } from "react-icons/ri";
import InfoNote from '@/components/common/CompleteProfileInfo';

const Page = () => {
  const { expertData, isLoading, failureReason } = useExpertContext();
  const router = useRouter();
  useHandleApiResponse(failureReason);


  if (isLoading) return <PageLoader />;
  const onEdit = () => router.push('/portal/teacher/editProfile');
  return (
    <React.Fragment>
      {(!expertData?.is_profile_complete || !expertData?.has_event_or_consult || !expertData?.stripe_onboarded) && <InfoNote expertData={expertData} />}
      <div className='relative'>
        <button
          className="absolute right-6 top-6 z-20 inline-flex items-center gap-2 justify-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30"
          onClick={onEdit}
        >
          <RiEdit2Line className="w-4 h-4" />
          Edit Profile
        </button>
        <UserProfileDetails data={expertData} />
      </div>
    </React.Fragment>
  );
};

export default Page;
