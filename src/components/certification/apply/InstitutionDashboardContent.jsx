'use client';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import { getMyInstitutionApplication } from '@/services/private/certification/application';
import CreatorDashboard from '@/components/creator/CreatorDashboard';
import PageLoader from '@/components/common/loader/PageLoader';

const InstitutionDashboardContent = () => {
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.myInstitutionApplication],
    queryFn: getMyInstitutionApplication,
    select: res => res?.data,
    retry: false,
  });

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <CreatorDashboard
      creatorType="institution"
      applicationStatus={data?.application_status || 'submitted'}
      rejectedReason={data?.rejected_reason}
      // reapplyHref="/certification/apply-institution" // Backend update endpoint is deferred to a future phase
    />
  );
};

export default InstitutionDashboardContent;
