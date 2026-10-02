'use client';

import { useQuery } from '@tanstack/react-query';
import Spinner from '@/components/common/loader/Spinner';
import { getReliefSaved } from '@/services/private/customer/v2/relief';
import queryKeys from '@/utils/query-keys';
import SavedTab from './SavedTab';

export default function ReliefSavedPage() {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: [queryKeys.customerV2ReliefSaved],
    queryFn: getReliefSaved,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-12 text-center text-gray-500">
        We couldn&apos;t load saved tools. Please refresh and try again.
      </p>
    );
  }

  return <SavedTab data={response?.data?.data} />;
}
