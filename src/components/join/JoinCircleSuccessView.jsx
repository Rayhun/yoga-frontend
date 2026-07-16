'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import JoinOnboardLayout from '@/components/join/onboard/JoinOnboardLayout';
import JoinOnboardStep3 from '@/components/join/onboard/JoinOnboardStep3';
import {
  getExpertCommunityJoinDetail,
  getExpertCommunityJoinedSuccess,
  toAppPath,
} from '@/services/private/expert/community';
import queryKeys from '@/utils/query-keys';

const JoinCircleSuccessView = ({ slug }) => {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryFn: () => getExpertCommunityJoinedSuccess(slug),
    queryKey: [queryKeys.expertCommunityJoinedSuccess, slug],
    enabled: !!slug,
    refetchOnMount: 'always',
  });

  const { data: inviteResponse } = useQuery({
    queryFn: () => getExpertCommunityJoinDetail(slug),
    queryKey: [queryKeys.expertCommunityJoinDetail, slug],
    enabled: !!slug,
    refetchOnMount: 'always',
  });

  const stepData = data?.data?.data;
  const inviteData = inviteResponse?.data?.data;

  if (isLoading) return <PageLoader />;

  if (isError || !stepData) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/40 bg-white p-8 text-center shadow-2xl">
          <h2 className="mb-2 font-serif text-xl font-semibold text-gray-800">
            Unable to load success details
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Your payment may still have gone through. You can continue to your inbox.
          </p>
          <button
            type="button"
            onClick={() => router.push('/portal/inbox')}
            className="w-full rounded-xl bg-[#1E4D35] px-6 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
          >
            Enter Circle
          </button>
        </div>
      </div>
    );
  }

  const showProgress = stepData?.navigation?.show_progress_bar !== false;
  const canGoBack = stepData?.navigation?.can_go_back === true;
  const enterPath =
    toAppPath(stepData?.footer_actions?.primary_button?.frontend_url) || '/portal/inbox';

  return (
    <JoinOnboardLayout
      canGoBack={canGoBack}
      showProgress={showProgress}
      inviteData={inviteData}
    >
      <JoinOnboardStep3
        stepData={stepData}
        onEnterCircle={() => router.push(enterPath)}
      />
    </JoinOnboardLayout>
  );
};

export default JoinCircleSuccessView;
