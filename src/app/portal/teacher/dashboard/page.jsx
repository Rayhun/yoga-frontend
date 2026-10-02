'use client';

import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import TeacherQTEStatusBanner from '@/components/certification/apply/TeacherQTEStatusBanner';
import ExpertHomeDashboard from '@/components/expert/HomeDashboard';
import useAuthContext from '@/hooks/useAuthContext';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { getExpertHomeDashboard } from '@/services/private/expert/dashboard';
import queryKeys from '@/utils/query-keys';

export default function Page() {
  const { user } = useAuthContext();
  const userRole = user?.profile?.role ?? '';

  const { data, isLoading, failureReason, isError } = useQuery({
    queryFn: getExpertHomeDashboard,
    queryKey: [queryKeys.expertHomeDashboard],
    enabled: userRole === 'Teacher',
    refetchOnMount: 'always',
  });

  useHandleApiResponse(failureReason);

  if (!user || userRole !== 'Teacher') {
    return <PageLoader />;
  }

  if (isLoading) return <PageLoader />;

  if (isError || !data?.data?.data) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">Unable to load dashboard</h2>
        <p className="text-sm text-gray-500">Please try again in a moment.</p>
      </div>
    );
  }

  return (
    <div>
      <TeacherQTEStatusBanner />
      <ExpertHomeDashboard data={data.data.data} />
    </div>
  );
}
