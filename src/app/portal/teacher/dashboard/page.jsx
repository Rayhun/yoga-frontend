'use client';

import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import TeacherQTEStatusBanner from '@/components/certification/apply/TeacherQTEStatusBanner';
import ExpertHomeDashboard from '@/components/expert/HomeDashboard';
import useAuthContext from '@/hooks/useAuthContext';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import useApprovedQTE from '@/hooks/useApprovedQTE';
import QteDashboard from '@/components/qte/QteDashboard';
import { QTE_VIEW } from '@/utils/qteTrack';
import { getExpertHomeDashboard } from '@/services/private/expert/dashboard';
import queryKeys from '@/utils/query-keys';

export default function Page() {
  const { user } = useAuthContext();
  const userRole = user?.profile?.role ?? '';
  const qte = useApprovedQTE();

  // The Expert dashboard API answers 403 for QTE-track accounts, so it is never requested for them.
  const { data, isLoading, failureReason, isError } = useQuery({
    queryFn: getExpertHomeDashboard,
    queryKey: [queryKeys.expertHomeDashboard],
    enabled: userRole === 'Teacher' && qte.view === QTE_VIEW.NOT_QTE,
    refetchOnMount: 'always',
  });

  useHandleApiResponse(failureReason);

  if (!user || userRole !== 'Teacher' || qte.isLoading) {
    return <PageLoader />;
  }

  // QTE track (any status) never sees the Expert dashboard; the guard sends a draft to the wizard.
  if (qte.isQteTrack) return <QteDashboard />;

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
