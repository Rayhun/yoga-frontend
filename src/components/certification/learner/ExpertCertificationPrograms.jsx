'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Spinner from '@/components/common/loader/Spinner';
import { getPublicCertificationPrograms } from '@/services/public/expert';
import queryKeys from '@/utils/query-keys';
import ProgramCard from './ProgramCard';

/**
 * A QTE's published certification programs on their public / learner-facing profile — shown instead of
 * Guided Experiences. Cards open the learner's program page (logged-out visitors are asked to sign in there).
 */
const ExpertCertificationPrograms = ({ expertId, tabEnabled = true }) => {
  const router = useRouter();
  const { data: programs, isFetching } = useQuery({
    queryKey: [queryKeys.publicExpertCertificationPrograms, expertId],
    queryFn: () => getPublicCertificationPrograms({ id: expertId }),
    select: res => res?.data?.data,
    enabled: Boolean(expertId) && tabEnabled,
  });

  if (isFetching && !programs) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }
  if (!Array.isArray(programs) || programs.length === 0) {
    return <p className="py-10 text-center text-gray-500">No certification programs are published yet.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {programs.map(program => (
        <ProgramCard key={program.id} program={program} onClick={() => router.push(`/portal/customer/certification/${program.id}`)} />
      ))}
    </div>
  );
};

export default ExpertCertificationPrograms;
