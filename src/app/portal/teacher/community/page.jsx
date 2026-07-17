'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import FullScreenLoader from '@/components/common/loader/FullScreenLoader';
import CommunityDetailView from '@/components/inbox/community/CommunityDetailView';
import { getExpertCommunityDetail } from '@/services/private/expert/community';
import useAuthContext from '@/hooks/useAuthContext';
import { USER_ROLE } from '@/utils/authorization';
import queryKeys from '@/utils/query-keys';

const Page = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const isExpert = user?.profile?.role === USER_ROLE.TEACHER;
  const hasChatGroup = Boolean(user?.profile?.is_chat_group);

  const { data, isLoading, isError } = useQuery({
    queryFn: getExpertCommunityDetail,
    queryKey: [queryKeys.expertCommunityDetail],
    refetchOnMount: 'always',
    enabled: isExpert && hasChatGroup,
  });

  useEffect(() => {
    if (!isExpert) {
      router.replace('/portal/inbox');
      return;
    }
    if (!hasChatGroup) {
      router.replace('/portal/teacher/community/create');
    }
  }, [isExpert, hasChatGroup, router]);

  if (!isExpert || !hasChatGroup) {
    return <FullScreenLoader />;
  }

  const pageData = data?.data?.data;

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex w-full flex-col gap-6">
      <Link
        href="/portal/inbox"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to Circles
      </Link>

      {isError || !pageData ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-600">
            Unable to load your community circle. Please try again.
          </p>
        </div>
      ) : (
        <CommunityDetailView pageData={pageData} />
      )}
    </div>
  );
};

export default Page;
