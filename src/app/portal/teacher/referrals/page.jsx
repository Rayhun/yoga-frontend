'use client';

import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import ExpertReferralsView from '@/components/expert/Referrals';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { getExpertReferrals } from '@/services/private/expert/referrals';
import queryKeys from '@/utils/query-keys';

const Page = () => {
  const { data, isLoading, failureReason, isError } = useQuery({
    queryFn: getExpertReferrals,
    queryKey: [queryKeys.expertReferrals],
    refetchOnMount: 'always',
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  if (isError || !data?.data?.data) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">Unable to load referrals</h2>
        <p className="text-sm text-gray-500">Please try again in a moment.</p>
      </div>
    );
  }

  return <ExpertReferralsView data={data.data.data} />;
};

export default Page;
