'use client';

import { useQuery } from '@tanstack/react-query';
import Spinner from '@/components/common/loader/Spinner';
import { getCustomerHomePage } from '@/services/private/customer/v2/home';
import queryKeys from '@/utils/query-keys';
import ReturningUserHome from './ReturningUserHome';
import NewUserHome from './NewUserHome';

export default function HomeDashboard() {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: [queryKeys.customerV2HomePage],
    queryFn: getCustomerHomePage,
  });

  const home = response?.data?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center bg-brownish/30">
        <Spinner />
      </div>
    );
  }

  if (isError || !home) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center px-4 text-center text-gray-600">
        We couldn&apos;t load your home page. Please refresh and try again.
      </div>
    );
  }

  if (home.is_new_user) {
    return <NewUserHome home={home} />;
  }

  return <ReturningUserHome home={home} />;
}
