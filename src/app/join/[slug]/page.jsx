'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import JoinCircleView from '@/components/join/JoinCircleView';
import { getExpertCommunityJoinDetail } from '@/services/private/expert/community';
import queryKeys from '@/utils/query-keys';

const Page = () => {
  const params = useParams();
  const slug = params?.slug;

  const { data, isLoading, isError } = useQuery({
    queryFn: () => getExpertCommunityJoinDetail(slug),
    queryKey: [queryKeys.expertCommunityJoinDetail, slug],
    enabled: !!slug,
    refetchOnMount: 'always',
  });

  const pageData = data?.data?.data;

  if (isLoading) return <PageLoader />;

  if (isError || !pageData) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-sm sm:p-10">
          <h2 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl">
            Circle Not Found
          </h2>
          <p className="text-sm leading-relaxed text-gray-500">
            This invitation link may be invalid or expired. Please check the link and try again.
          </p>
        </div>
      </div>
    );
  }

  return <JoinCircleView pageData={pageData} slug={slug} />;
};

export default Page;
