'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPublicExpertProfile } from '@/services/public/expert';
import queryKeys from '@/utils/query-keys';
import PageLoader from '@/components/common/loader/PageLoader';
import PublicExpertProfile from '@/components/public/expertProfile';

const Page = () => {
  const params = useParams();

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryFn: () => getPublicExpertProfile({ username: params.id }),
    queryKey: [queryKeys.publicExpertProfile, params.id],
    enabled: !!params?.id,
  });

  if (isLoading) return <PageLoader />;

  if (isError || !response?.data?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Expert Not Found</h2>
          <p className="text-gray-500">The expert profile you are looking for does not exist or is unavailable.</p>
        </div>
      </div>
    );
  }

  const expertData = response?.data?.data;

  return <PublicExpertProfile data={expertData} />;
};

export default Page;
