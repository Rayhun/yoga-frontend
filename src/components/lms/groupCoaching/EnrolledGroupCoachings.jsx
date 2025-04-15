'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import queryKeys from '@/utils/query-keys';
import ConsultationCard from '../common/ConsultationCard';
import { getEnrolledGroupCoachings } from '@/services/private/customer/groupCoaching';
import EventCard from '../common/EventCard';

// const STATUS_FILTERS = [
//   {
//     label: 'All',
//     value: '',
//   },
//   {
//     label: 'In Progress',
//     value: 'InProgress',
//   },
//   {
//     label: 'Completed',
//     value: 'Complete',
//   },
// ];

const EnrolledGroupCoachings = () => {
  const router = useRouter();
  const searchParams = useSearchParamUtils();
  const selectedStatus = searchParams.get('status') || '';
  const { isLoading: isLoadingCoachings, data: coachingsResponse } = useQuery({
    queryFn: getEnrolledGroupCoachings,
    queryKey: [queryKeys.customerEnrolledGroupCoachings, selectedStatus],
  });

  //   const handleStatusSelect = selected => {
  //     if (!selected.value) searchParams.remove('status');
  //     else searchParams.set('status', selected?.value);
  //   };


  const coachings = coachingsResponse?.data?.results?.data?.['all-events'] || [];

  return (
    <div className="min-h-[60vh] flex flex-col gap-4 md:gap-7 p-6 bg-white rounded-lg shadow-md">
      {/* Status Filters */}
      {/* <div className="flex gap-3 justify-center">
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
      </div> */}

      {/* Content Cards */}
      <section>
        {isLoadingCoachings ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div>
            {coachings.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {coachingsResponse?.data?.results?.data?.['all-events']?.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => router.push(`/portal/customer/group_coaching/${event.id}/details`)}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-[300px] flex justify-center items-center">No consultations found</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default EnrolledGroupCoachings;
