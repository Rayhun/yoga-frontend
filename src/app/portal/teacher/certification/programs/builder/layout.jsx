'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useApprovedQTE from '@/hooks/useApprovedQTE';
import PageLoader from '@/components/common/loader/PageLoader';

/**
 * Approved-creator guard (KAN-90). "Approved QTE" comes from the auth payload's creator_type /
 * application_status via useApprovedQTE (no request of its own any more); anyone else is sent to the
 * teacher dashboard, which shows a QTE-track user their QTE dashboard.
 */
const Layout = ({ children }) => {
  const router = useRouter();
  const { isApprovedQTE, isLoading } = useApprovedQTE();

  useEffect(() => {
    if (!isLoading && !isApprovedQTE) router.replace('/portal/teacher/dashboard');
  }, [isLoading, isApprovedQTE, router]);

  if (isLoading || !isApprovedQTE) return <PageLoader />;

  return children;
};

export default Layout;
