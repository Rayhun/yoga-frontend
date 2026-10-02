'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import JoinOnboardWizard from '@/components/join/onboard/JoinOnboardWizard';
import {
  getExpertCommunityJoinDetail,
  getExpertCommunityJoinOnboard,
} from '@/services/private/expert/community';
import queryKeys from '@/utils/query-keys';

const Page = () => {
  const params = useParams();
  const slug = params?.slug;

  const { data, isLoading, isError } = useQuery({
    queryFn: () => getExpertCommunityJoinOnboard(slug),
    queryKey: [queryKeys.expertCommunityJoinOnboard, slug],
    enabled: !!slug,
    refetchOnMount: 'always',
  });

  const { data: inviteResponse } = useQuery({
    queryFn: () => getExpertCommunityJoinDetail(slug),
    queryKey: [queryKeys.expertCommunityJoinDetail, slug],
    enabled: !!slug,
    refetchOnMount: 'always',
  });

  const wizardData = data?.data?.data;
  const inviteData = inviteResponse?.data?.data;

  if (isLoading) return <PageLoader />;

  if (isError || !wizardData) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/40 bg-white p-8 text-center shadow-2xl">
          <h2 className="mb-2 font-serif text-xl font-semibold text-gray-800">
            Onboarding Not Found
          </h2>
          <p className="text-sm text-gray-500">
            This join flow may be invalid or expired. Please check your invitation link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <JoinOnboardWizard wizardData={wizardData} inviteData={inviteData} slug={slug} />
  );
};

export default Page;
