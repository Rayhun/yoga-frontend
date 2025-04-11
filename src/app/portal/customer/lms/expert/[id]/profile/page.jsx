'use client';
import React from 'react'
import UserProfileDetails from '@/components/customer/expertPublicProfile';
import { useParams } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import { getSingleExpert } from '@/services/private/lms/expert';
import queryKeys from '@/utils/query-keys';
import { useQuery } from '@tanstack/react-query';

const Page = () => {
  const params = useParams();

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleExpert({ id: params.id }),
    queryKey: [queryKeys.teacherProfile, params.id],
    enabled: !!params?.id,
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  const expertData = response?.data?.data

  return <UserProfileDetails data={expertData} />;
};

export default Page;
