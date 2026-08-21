'use client';
import React, { useState } from 'react'
import UserProfileDetails from '@/components/expert/profile';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import { useExpertContext } from '@/hooks/useExpert';
import useAuthContext from '@/hooks/useAuthContext';
import { RiEdit2Line } from "react-icons/ri";
import { FiShare2 } from "react-icons/fi";
import InfoNote from '@/components/common/CompleteProfileInfo';
import ShareProfileDialog from '@/components/expert/profile/ShareProfileDialog';

const Page = () => {
  const { expertData, isLoading, failureReason } = useExpertContext();
  const { user } = useAuthContext();
  const router = useRouter();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  useHandleApiResponse(failureReason);

  const isChatGroup = Boolean(user?.profile?.is_chat_group);
  const showQuickSteps =
    !expertData?.is_profile_complete ||
    !expertData?.has_event_or_consult ||
    !expertData?.stripe_onboarded ||
    !isChatGroup;

  if (isLoading) return <PageLoader />;
  const onEdit = () => router.push('/portal/teacher/editProfile');

  return (
    <React.Fragment>
      {showQuickSteps && <InfoNote expertData={expertData} />}
      <div className='relative'>
        <div className="absolute right-6 top-6 z-20 flex items-center gap-3">
          {expertData?.is_profile_complete && (
            <button
              className="inline-flex items-center gap-2 justify-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30"
              onClick={() => setShareDialogOpen(true)}
            >
              <FiShare2 className="w-4 h-4" />
              Share Profile
            </button>
          )}
          <button
            className="inline-flex items-center gap-2 justify-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30"
            onClick={onEdit}
          >
            <RiEdit2Line className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
        <UserProfileDetails data={expertData} />
      </div>

      <ShareProfileDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        publicUsername={expertData?.public_username}
        expertId={expertData?.id}
      />
    </React.Fragment>
  );
};

export default Page;
