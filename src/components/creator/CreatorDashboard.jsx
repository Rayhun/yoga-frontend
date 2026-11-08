'use client';
import Link from 'next/link';
import ApplicationStatusCard from '@/components/certification/apply/ApplicationStatusCard';
import useCreatorDashboard from '@/hooks/useCreatorDashboard';
import { AttentionCard, ChartCard, FunnelCard, RecentActivityCard } from './DashboardCards';
import KpiRow from './KpiRow';
import { CreateFirstProgramCard, ProgramsSection } from './ProgramsSection';
import { dashboardTitle, isCreatorDashboardEnabled } from './dashboardModel';

export const SUPPORT_HREF = '/portal/help-support';

const Header = ({ creatorType }) => (
  <div>
    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{dashboardTitle(creatorType)}</h1>
    <p className="text-sm text-gray-600 dark:text-gray-400">Your certification programs, learners and certificates at a glance.</p>
  </div>
);

/**
 * The overview both creator kinds see ('qte' at /portal/teacher/dashboard, 'institution' at
 * /portal/institution/dashboard). Only an approved creator gets numbers: any other `applicationStatus`
 * shows the status card with its next step and never requests the summary or activity endpoints.
 */
const CreatorDashboard = ({ creatorType, applicationStatus, rejectedReason, reapplyHref }) => {
  const enabled = isCreatorDashboardEnabled(applicationStatus);
  const { summary, activity } = useCreatorDashboard({ enabled });

  if (!enabled) {
    return (
      <div className="flex flex-col gap-6">
        <Header creatorType={creatorType} />
        <ApplicationStatusCard applicationStatus={applicationStatus} rejectedReason={rejectedReason} reapplyHref={reapplyHref} />
        {applicationStatus === 'suspended' ? (
          <Link href={SUPPORT_HREF} className="text-sm font-medium text-green-700 underline hover:text-green-800">
            Contact support
          </Link>
        ) : null}
      </div>
    );
  }

  const data = summary.data;
  const summaryProps = { loading: summary.isLoading, error: summary.isError, onRetry: summary.refetch };
  const hasNoPrograms = Boolean(data) && data.kpis?.programs_total === 0;

  return (
    <div className="flex flex-col gap-6">
      <Header creatorType={creatorType} />
      <KpiRow kpis={data?.kpis} {...summaryProps} />

      {/* items-start: each card is as tall as its own content (no stretching to the chart's height). The
          chart sits beside a column that stacks "Needs your attention" and the journey funnel, so the two
          sides come out about the same height. */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3 lg:gap-6">
        {hasNoPrograms ? (
          <CreateFirstProgramCard creatorType={creatorType} className="lg:col-span-2" />
        ) : (
          <ChartCard weekly={data?.weekly} className="lg:col-span-2" {...summaryProps} />
        )}
        <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
          <AttentionCard attention={data?.attention} {...summaryProps} />
          {hasNoPrograms ? null : <FunnelCard funnel={data?.funnel} {...summaryProps} />}
        </div>
      </div>

      <RecentActivityCard
        items={activity.data}
        loading={activity.isLoading}
        error={activity.isError}
        onRetry={activity.refetch}
      />

      {hasNoPrograms ? null : (
        <ProgramsSection programs={data?.programs} creatorType={creatorType} {...summaryProps} />
      )}
    </div>
  );
};

export default CreatorDashboard;
