'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import ProgramCard from './ProgramCard';
import { getEnrolledCertifications } from '@/services/private/certification/catalog';
import queryKeys from '@/utils/query-keys';

const STATUS_FILTERS = [
  {
    label: 'All',
    value: '',
  },
  {
    label: 'In Progress',
    value: 'InProgress',
  },
  {
    label: 'Completed',
    value: 'Complete',
  },
];

const EnrolledCertifications = () => {
  const router = useRouter();
  const searchParams = useSearchParamUtils();
  const selectedStatus = searchParams.get('status') || '';
  const { isLoading, data: response } = useQuery({
    queryFn: () => getEnrolledCertifications({ status: selectedStatus }),
    queryKey: [queryKeys.certificationEnrolledCertifications, selectedStatus],
  });

  const handleStatusSelect = selected => {
    if (!selected.value) searchParams.remove('status');
    else searchParams.set('status', selected?.value);
  };

  const programs = response?.data?.results?.data?.['all-programs'] || [];

  return (
    <div className="min-h-[60vh] flex flex-col gap-4 md:gap-7 p-6 bg-white rounded-lg shadow-md">
      <div className="w-full h-[30px] flex justify-center items-center text-center text-gray-500 px-4">
        Continue where you left off, or explore new programs in the Library.
      </div>
      {/* Status Filters */}
      <div className="flex gap-3 justify-center">
        {STATUS_FILTERS.map(filter => (
          <div
            key={filter.value}
            className={`text-xs md:text-sm border text-nowrap cursor-pointer px-2 py-1 md:px-4 md:py-2 rounded-full ${
              selectedStatus === filter.value
                ? 'bg-primary border-primary text-white'
                : 'text-gray-400 border-gray-400'
            }`}
            onClick={() => handleStatusSelect(filter)}
          >
            {filter.label}
          </div>
        ))}
      </div>

      {/* Content Cards */}
      <section>
        {isLoading ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div>
            {programs.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {programs.map((program, index) => (
                  <ProgramCard
                    key={`${program.id}-${program.title}-${index}`}
                    program={{ ...program, is_enrolled: true }}
                    onClick={() => router.push(`/portal/customer/certification/${program.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-[300px] flex justify-center items-center text-gray-500">
                No certifications found. Explore the Library to get started!
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default EnrolledCertifications;
