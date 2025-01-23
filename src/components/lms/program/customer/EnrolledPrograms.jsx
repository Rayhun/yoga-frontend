'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import ProgramCard from './ProgramCard';
import { getProgramsList } from '@/services/private/customer/program';
import queryKeys from '@/utils/query-keys';

const STATUS_FILTERS = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'In Progress',
    value: 'in_progress',
  },
  {
    label: 'Completed',
    value: 'completed',
  },
];

const EnrolledPrograms = () => {
  const router = useRouter();
  const searchParams = useSearchParamUtils();
  const selectedStatus = searchParams.get('status') || 'all';
  const { isLoading: isLoadingPrograms, data: programsResponse } = useQuery({
    queryFn: getProgramsList,
    queryKey: [queryKeys.customerPrograms],
  });

  const handleStatusSelect = selected => {
    if (selected.value === 'all') searchParams.remove('status');
    else searchParams.set('status', selected?.value);
  };

  return (
    <div className="flex flex-col gap-4 md:gap-7">
      {/* Status Filters */}
      <div className="flex gap-3 justify-center">
        {STATUS_FILTERS.map(filter => (
          <div
            key={filter.value}
            className={`text-xs md:text-sm border  text-nowrap cursor-pointer px-2 py-1 md:px-4 md:py-2 rounded-full ${
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
        {isLoadingPrograms ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {programsResponse.data?.results?.data?.['all-programs']?.map(program => (
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

export default EnrolledPrograms;
