'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import MyProgramCard from '@/components/certification/mine/MyProgramCard';
import Spinner from '@/components/common/loader/Spinner';
import { creatorRoutes } from '@/components/creator/dashboardModel';
import { getMyPrograms } from '@/services/private/certification/program';
import queryKeys from '@/utils/query-keys';

/**
 * The "Certification Programs" tab of a QTE / Institution profile (it takes the place of Guided Experiences):
 * the creator's own programs, with the same cards and links as the Certification Programs list. Only an
 * approved creator can list programs (the API answers 403 before that), so nothing is requested until
 * `approved`; the "Create your first certification program" button is likewise approved-only.
 */
const ExpertProfileCertifications = ({ creatorType = 'qte', approved = false }) => {
  const { data: programs, isFetching } = useQuery({
    queryKey: [queryKeys.certificationMyPrograms],
    queryFn: getMyPrograms,
    select: res => res?.data,
    enabled: approved,
    retry: false,
  });

  if (!approved) {
    return (
      <p className="py-10 text-center text-gray-500">
        Your certification programs will show up here once your application is approved.
      </p>
    );
  }
  if (isFetching && !programs) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }
  if (!Array.isArray(programs) || programs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
        <p>You haven&apos;t created any programs yet.</p>
        <Link
          href={creatorRoutes(creatorType).newProgram}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Create your first certification program
        </Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {programs.map(program => (
        <MyProgramCard key={program.id} program={program} creatorType={creatorType} />
      ))}
    </div>
  );
};

export default ExpertProfileCertifications;
