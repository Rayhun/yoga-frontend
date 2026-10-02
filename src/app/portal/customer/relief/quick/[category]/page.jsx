'use client';

import { useQuery } from '@tanstack/react-query';
import Spinner from '@/components/common/loader/Spinner';
import QuickDetailView from '@/components/customer/v2/Relief/QuickDetailView';
import { getQuickDetail } from '@/services/private/customer/v2/relief';
import queryKeys from '@/utils/query-keys';

export default function QuickDetailPage({ params }) {
  const { category } = params;

  const { data: response, isLoading, isError } = useQuery({
    queryKey: [queryKeys.customerV2ReliefQuickDetail, category],
    queryFn: () => getQuickDetail(category),
    enabled: Boolean(category),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !response?.data?.data) {
    return (
      <p className="py-12 text-center text-gray-500">
        We couldn&apos;t load this relief tool. Please go back and try again.
      </p>
    );
  }

  return <QuickDetailView data={response.data.data} category={category} />;
}
