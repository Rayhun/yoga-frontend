'use client';
import { MdVerified } from 'react-icons/md';
import MyProgramsList from '@/components/certification/mine/MyProgramsList';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import { getMyInstitutionApplication } from '@/services/private/certification/application';
import PageLoader from '@/components/common/loader/PageLoader';

const InstitutionProgramsContent = () => {
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.myInstitutionApplication],
    queryFn: getMyInstitutionApplication,
    select: res => res?.data,
    retry: false,
  });

  if (isLoading) return <PageLoader />;

  // Guard: institution must be approved
  if (!data || data.application_status !== 'approved') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <MdVerified className="text-gray-300 text-6xl mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">
          Access Restricted
        </h2>
        <p className="text-sm text-gray-500 max-w-sm">
          Certification program tools are only available after your institution application has been approved.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <MyProgramsList creatorType="institution" />
    </div>
  );
};

export default InstitutionProgramsContent;
