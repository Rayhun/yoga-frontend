'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import ApplicationStatusCard from '@/components/certification/apply/ApplicationStatusCard';
import PageLoader from '@/components/common/loader/PageLoader';
import CreatorDashboard from '@/components/creator/CreatorDashboard';
import useApprovedQTE from '@/hooks/useApprovedQTE';
import queryKeys from '@/utils/query-keys';
import { QTE_REAPPLY_PATH, QTE_VIEW } from '@/utils/qteTrack';

export const SUPPORT_HREF = '/portal/help-support';

/**
 * What a QTE-track user sees at /portal/teacher/dashboard (the Expert dashboard is never rendered for them).
 * `draft` is the locked state — the guard sends those users to the application wizard, so it only shows a
 * loader here as a backstop. suspended: locked explanatory view + support link. Every other status goes to
 * the shared creator dashboard: approved gets the overview numbers, submitted / under_review / rejected get
 * only the status card (with the rejection reason and a re-apply link when rejected) and no data requests.
 */
const QteDashboard = () => {
  const qte = useApprovedQTE();
  const queryClient = useQueryClient();

  // The status lives in the auth payload, which is only fetched at app start: refresh it once per visit so
  // an approval (or suspension) made meanwhile shows up without a full page reload.
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: [queryKeys.loggedInUser] });
  }, [queryClient]);

  if (qte.view === QTE_VIEW.SUSPENDED) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-4">
        <ApplicationStatusCard applicationStatus="suspended" />
        <Link href={SUPPORT_HREF} className="text-sm font-medium text-green-700 underline hover:text-green-800">
          Contact support
        </Link>
      </div>
    );
  }
  if (qte.view !== QTE_VIEW.UNLOCKED) return <PageLoader />;

  return (
    <CreatorDashboard
      creatorType="qte"
      applicationStatus={qte.applicationStatus}
      rejectedReason={qte.rejectedReason}
      reapplyHref={QTE_REAPPLY_PATH}
    />
  );
};

export default QteDashboard;
