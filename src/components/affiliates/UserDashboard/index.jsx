'use client';
import React from 'react';
import CardDataStats from '../../stats/CardDataStats';
import { FiMousePointer, FiDollarSign } from 'react-icons/fi';
import { TbUsers } from 'react-icons/tb';
import { PiShoppingCartSimple } from 'react-icons/pi';
import PageLoader from '@/components/common/loader/PageLoader';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { getAffiliatesUsersDashboard } from '@/services/private/affiliates/dashboard';
import queryKeys from '@/utils/query-keys';
import { useQuery } from '@tanstack/react-query';
import EarningChart from '../EarningChart';
import ConversionChart from './Chart';

const AffiliateUserDashboard = () => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getAffiliatesUsersDashboard(),
    queryKey: [queryKeys.affiliatesUsersDashboard],
  });

  const dashboardData = response?.data?.data;

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-6 2xl:gap-7.5">
        <CardDataStats title="Total Clicks" total={dashboardData?.clicks?.value}>
          <FiMousePointer className="text-primary" size={20} />
        </CardDataStats>
        <CardDataStats
          title="New Signups"
          total={dashboardData?.signups?.value}
        >
          <TbUsers className="text-primary" size={20} />
        </CardDataStats>
        <CardDataStats title="First Purchase" total={dashboardData?.purchases?.value}>
          <PiShoppingCartSimple className="text-primary" size={20} />
        </CardDataStats>
        <CardDataStats
          title="Total Sale"
          total={`$${dashboardData?.total_sales}`}
        >
          <FiDollarSign className="text-primary" size={20} />
        </CardDataStats>
        <CardDataStats
          title="Commission Earned"
          total={`$${dashboardData?.commission?.value}`}
        >
          <FiDollarSign className="text-primary" size={20} />
        </CardDataStats>
        <CardDataStats
          title="Pending Commission"
          total={`$${dashboardData?.commission?.pending || '0'}`}
        >
          <FiDollarSign className="text-primary" size={20} />
        </CardDataStats>
      </div>

      <div className="mt-4 space-y-6">
        <EarningChart earnings_over_time={dashboardData?.earnings_over_time} />
        <ConversionChart traffic_conversions={dashboardData?.traffic_conversions} />
      </div>
    </>
  );
};

export default AffiliateUserDashboard;
