'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Alert from '@mui/material/Alert';
import Spinner from '@/components/common/loader/Spinner';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { toastApiError } from '@/utils/helpers';
import ProgramCard from './ProgramCard';
import { getCertificationCatalog } from '@/services/private/certification/catalog';
import { checkoutCertificationProgram } from '@/services/private/certification/enrollment';
import queryKeys from '@/utils/query-keys';

const AUDIENCE_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Career Track', value: 'career' },
  { label: 'Professional Track', value: 'professional' },
];

const DiscoverPanel = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrolledProgramId = searchParams.get('enrolled');
  const [selectedAudience, setSelectedAudience] = useState('');

  const {
    data: response,
    isFetching,
    failureReason,
    refetch,
  } = useQuery({
    queryFn: () => getCertificationCatalog({ target_audience: selectedAudience }),
    queryKey: [queryKeys.certificationCatalog, selectedAudience],
  });

  useHandleApiResponse(failureReason);

  const { mutateAsync: checkout, isPending: isEnrolling } = useMutation({
    mutationFn: checkoutCertificationProgram,
  });

  const programs = response?.data || [];

  const handleEnroll = async program => {
    if (isEnrolling) return;

    if (program.payment_type === 'free') {
      try {
        await checkout({ id: program.id });
        toast.success('Enrolled successfully!');
        refetch();
        router.push(`/portal/customer/certification?enrolled=${program.id}`);
      } catch (error) {
        toastApiError(error);
      }
      return;
    }

    router.push(`/payment/certification/${program.id}`);
  };

  return (
    <div className="flex flex-col gap-5">
      {enrolledProgramId && (
        <Alert severity="success" onClose={() => router.replace('/portal/customer/certification')}>
          {"You're enrolled! Head to My Certifications to get started."}
        </Alert>
      )}

      <div className="flex gap-2">
        {AUDIENCE_FILTERS.map(filter => (
          <button
            key={filter.value}
            onClick={() => setSelectedAudience(filter.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedAudience === filter.value
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isFetching ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : programs.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {programs.map(program => (
            <ProgramCard key={program.id} program={program} onClick={() => handleEnroll(program)} />
          ))}
        </div>
      ) : (
        <div className="w-full h-[200px] flex justify-center items-center text-gray-500">No programs found.</div>
      )}
    </div>
  );
};

export default DiscoverPanel;
