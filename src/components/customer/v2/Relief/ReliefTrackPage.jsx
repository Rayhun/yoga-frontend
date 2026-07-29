'use client';

import { useQuery } from '@tanstack/react-query';
import Spinner from '@/components/common/loader/Spinner';
import { getReliefTrack } from '@/services/private/customer/v2/relief';
import queryKeys from '@/utils/query-keys';
import TrackTab from './TrackTab';

export default function ReliefTrackPage() {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: [queryKeys.customerV2ReliefTrack],
    queryFn: getReliefTrack,
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
        We couldn&apos;t load your tracker. Please refresh and try again.
      </p>
    );
  }

  return <TrackTab data={response?.data?.data} />;
}
