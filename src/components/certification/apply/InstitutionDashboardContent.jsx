'use client';
import { useQuery } from '@tanstack/react-query';
import { FaBuilding } from 'react-icons/fa';
import queryKeys from '@/utils/query-keys';
import { getMyInstitutionApplication } from '@/services/private/certification/application';
import ApplicationStatusCard from '@/components/certification/apply/ApplicationStatusCard';
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

  if (!data || data.application_status !== 'approved') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-lg">
          <ApplicationStatusCard
            applicationStatus={data?.application_status || 'submitted'}
            rejectedReason={data?.rejected_reason}
            reapplyHref="/certification/apply-institution"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-center">
      <div>
        <FaBuilding className="text-green-600 text-4xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Welcome to your Institution Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your application is approved. Certification program-building tools are coming soon.
        </p>
      </div>
    </div>
  );
};

export default InstitutionDashboardContent;
