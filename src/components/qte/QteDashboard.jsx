'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { MdOutlineRateReview, MdVerified, MdAdd } from 'react-icons/md';
import ApplicationStatusCard from '@/components/certification/apply/ApplicationStatusCard';
import PageLoader from '@/components/common/loader/PageLoader';
import useApprovedQTE, { NEW_CERTIFICATION_PROGRAM_HREF } from '@/hooks/useApprovedQTE';
import queryKeys from '@/utils/query-keys';
import { QTE_REAPPLY_PATH, QTE_VIEW } from '@/utils/qteTrack';

export const SUPPORT_HREF = '/portal/help-support';

const ENTRY_POINTS = [
  { label: 'Certification Programs', description: 'Build and manage your programs.', href: '/portal/teacher/certification/programs', Icon: MdVerified },
  { label: 'New Program', description: 'Start a new certification program.', href: NEW_CERTIFICATION_PROGRAM_HREF, Icon: MdAdd },
  { label: 'Grading Queue', description: 'Review learner submissions.', href: '/portal/teacher/certification/grading', Icon: MdOutlineRateReview },
];

const EntryPoint = ({ label, description, href, Icon, enabled }) => {
  const body = (
    <>
      <Icon className="text-2xl text-emerald-600" aria-hidden />
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white">{label}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{enabled ? description : 'Available after your application is approved.'}</p>
      </div>
    </>
  );
  const classes = 'flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800';
  return enabled ? (
    <Link href={href} className={`${classes} hover:border-emerald-400`}>{body}</Link>
  ) : (
    <div aria-disabled="true" className={`${classes} cursor-not-allowed opacity-60`}>{body}</div>
  );
};

/**
 * What a QTE-track user sees at /portal/teacher/dashboard (the Expert dashboard is never rendered for them).
 * `draft` is the locked state — the guard sends those users to the application wizard, so it only shows a
 * loader here as a backstop. suspended: locked explanatory view + support link. Every other status: the
 * status card (with the rejection reason and a re-apply link when rejected) and the certification entry
 * points, which stay disabled until approval (the backend refuses them before that anyway).
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">QTE Dashboard</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Your certification tools and application status.</p>
      </div>
      {qte.isApproved ? null : (
        <ApplicationStatusCard
          applicationStatus={qte.applicationStatus}
          rejectedReason={qte.rejectedReason}
          reapplyHref={QTE_REAPPLY_PATH}
        />
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {ENTRY_POINTS.map(entry => (
          <EntryPoint key={entry.label} {...entry} enabled={qte.isApproved} />
        ))}
      </div>
    </div>
  );
};

export default QteDashboard;
