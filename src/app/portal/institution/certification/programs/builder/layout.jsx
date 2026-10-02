'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import { getMyInstitutionApplication } from '@/services/private/certification/application';
import PageLoader from '@/components/common/loader/PageLoader';

/**
 * Approved-institution guard (KAN-90). Requires application_status === 'approved',
 * redirecting to the application-status page otherwise.
 */
const Layout = ({ children }) => {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKeys.myInstitutionApplication],
    queryFn: getMyInstitutionApplication,
    select: res => res?.data,
    retry: false,
  });

  const isApprovedInstitution = data?.creator_type === 'institution' && data?.application_status === 'approved';

  useEffect(() => {
    if (isLoading) return;
    if (isError || !isApprovedInstitution) {
      router.replace('/portal/institution/application');
    }
  }, [isLoading, isError, isApprovedInstitution, router]);

  if (isLoading || !isApprovedInstitution) {
    return <PageLoader />;
  }

  return children;
};

export default Layout;
