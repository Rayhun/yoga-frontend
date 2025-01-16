'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Spinner from '@/components/common/loader/Spinner';
import FeaturedCategories from '@/components/lms/category/FeaturedCategories';
import ProgramCard from './ProgramCard';
import { getProgramsList } from '@/services/private/lms/program';
import queryKeys from '@/utils/query-keys';

const CustomerEnrolledPrograms = () => {
  const router = useRouter();
  const { isLoading: isLoadingPrograms, data: programsResponse } = useQuery({
    queryFn: getProgramsList,
    queryKey: [queryKeys.lmsPrograms],
  });

  return (
    <div className="flex flex-col gap-4 md:gap-7">
      {/* Categories */}
      <FeaturedCategories />

      {/* Content Cards */}
      <section>
        {isLoadingPrograms ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {programsResponse?.data?.map(program => (
              <ProgramCard
                key={program.id}
                program={program}
                onClick={() => router.push(`/portal/customer/lms/program/${program.id}/details`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerEnrolledPrograms;
