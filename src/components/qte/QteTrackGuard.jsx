'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import PageLoader from '@/components/common/loader/PageLoader';
import useApprovedQTE from '@/hooks/useApprovedQTE';
import { resolveTeacherRoute } from '@/utils/qteTrack';

/**
 * Direct-URL guard for everything under /portal/teacher. A QTE-track user who types an Expert-only URL is
 * sent to the QTE dashboard (or to the application wizard while the application is still a draft); normal
 * Experts, learners and institutions pass straight through. While the profile is not loaded — and while a
 * redirect is on its way — only a loader renders, so no Expert page ever mounts (or fires its API calls)
 * for a QTE-track user. The rules live in utils/qteTrack.js (resolveTeacherRoute).
 */
const QteTrackGuard = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const qte = useApprovedQTE();
  const decision = resolveTeacherRoute(pathname, qte);

  useEffect(() => {
    if (decision.action === 'redirect') router.replace(decision.to);
  }, [decision.action, decision.to, router]);

  if (decision.action !== 'allow') return <PageLoader />;
  return children;
};

export default QteTrackGuard;
