'use client';

import { useQuery } from '@tanstack/react-query';
import Spinner from '@/components/common/loader/Spinner';
import { getQuickTools } from '@/services/private/customer/v2/relief';
import queryKeys from '@/utils/query-keys';
import QuickToolsTab from './QuickToolsTab';

export default function ReliefQuickToolsPage() {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: [queryKeys.customerV2ReliefQuickTools],
    queryFn: getQuickTools,
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
        We couldn&apos;t load quick tools. Please refresh and try again.
      </p>
    );
  }

  return <QuickToolsTab sections={response?.data?.data || []} />;
}
