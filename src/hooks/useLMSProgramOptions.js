'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProgramsList } from '@/services/private/lms/program';
import queryKeys from '@/utils/query-keys';

function useLMSProgramOptions() {
  const { isLoading, data: programsResponse } = useQuery({
    queryFn: getProgramsList,
    queryKey: [queryKeys.lmsPrograms],
  });

  const programOptions = useMemo(
    () =>
      programsResponse?.data?.map(option => ({
        label: option.title,
        value: option.id,
      })),
    [programsResponse?.data]
  );

  return {
    isLoading,
    options: programOptions,
  };
}

export default useLMSProgramOptions;
