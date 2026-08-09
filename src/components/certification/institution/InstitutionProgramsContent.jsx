'use client';
import { FaBuilding } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
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
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-8">
        <FaBuilding className="text-green-600 text-3xl" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Certification Programs</h1>
          <p className="text-sm text-gray-500">Manage and create certification programs for your institution</p>
        </div>
      </div>

      {/* Placeholder — Phase 2 will add program list + create form */}
      <div className="rounded-xl border-2 border-dashed border-green-200 bg-green-50 dark:bg-green-900/10 p-10 text-center">
        <MdVerified className="text-green-500 text-5xl mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
          Program builder coming soon
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Your institution is approved and ready. The full certification program creation toolkit will be available in the next phase.
        </p>
      </div>
    </div>
  );
};

export default InstitutionProgramsContent;
