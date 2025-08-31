'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import queryKeys from '@/utils/query-keys';
import { getEnrolledConsultations } from '@/services/private/customer/consultation';
import ConsultationCard from '../common/ConsultationCard';

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

const EnrolledConsultations = () => {
  const router = useRouter();
  const searchParams = useSearchParamUtils();
  const selectedStatus = searchParams.get('status') || '';
  const { isLoading: isLoadingPrograms, data: consultationResponse } = useQuery({
    queryFn: getEnrolledConsultations,
    queryKey: [queryKeys.customerEnrolledConsultations, selectedStatus],
  });

  //   const handleStatusSelect = selected => {
  //     if (!selected.value) searchParams.remove('status');
  //     else searchParams.set('status', selected?.value);
  //   };


  console.log("consultationResponse", consultationResponse)

  const consultations = consultationResponse?.data?.results?.data?.['all-events'] || [];

  return (
    <div className="flex flex-col gap-4 md:gap-7">
      {/* Hero Section */}
      <div className="bg-white rounded-md py-12 px-6 md:px-12 flex flex-col md:flex-row items-center dark:bg-boxdark dark:text-white">
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">Your Consultations</h1>
          <p className="break-words line-clamp-2 dark:text-gray-300">
            Access your scheduled consultations and connect with wellness experts for personalized guidance
          </p>
        </div>
        <div className="md:w-1/2 mt-6 md:mt-0 aspect-[16/9]">
          <Image
            src="/images/content/default.png"
            alt="Hero Image"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      </div>

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
          {isLoadingPrograms ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div>
              {consultations.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {consultationResponse?.data?.results?.data?.['all-events']?.map(consultation => (
                    <ConsultationCard
                      key={consultation.id}
                      consultation={consultation}
                      onClick={() => router.push(`/portal/customer/lms/consultation/${consultation.id}/details`)}
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
    </div>
  );
};

export default EnrolledConsultations;
