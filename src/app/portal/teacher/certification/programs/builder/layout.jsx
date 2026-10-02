'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import { getMyQTEApplication } from '@/services/private/certification/application';
import PageLoader from '@/components/common/loader/PageLoader';

/**
 * Approved-creator guard (KAN-90). Unlike the affiliate/customer layout guards, which read a
 * synchronous flag off useAuthContext, "approved QTE" isn't part of that context — it takes a
 * real fetch (same check TeacherQTEStatusBanner already uses), so this redirects post-fetch
 * rather than synchronously.
 */
const Layout = ({ children }) => {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKeys.myQTEApplication],
    queryFn: getMyQTEApplication,
    select: res => res?.data,
    retry: false,
  });

  const isApprovedQTE = data?.creator_type === 'qte' && data?.application_status === 'approved';

  useEffect(() => {
    if (isLoading) return;
    if (isError || !isApprovedQTE) {
      router.replace('/portal/teacher/dashboard');
    }
  }, [isLoading, isError, isApprovedQTE, router]);

  if (isLoading || !isApprovedQTE) {
    return <PageLoader />;
  }

  return children;
};

export default Layout;
