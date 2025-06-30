'use client';
import React from 'react';
import ChartOne from '../../charts/ChartOne';
import ChartTwo from '../../charts/ChartTwo';
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
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
          title="Commission Earned"
          total={`$${dashboardData?.commission?.value}`}
        >
          <FiDollarSign className="text-primary" size={20} />
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <EarningChart earnings_over_time={dashboardData?.earnings_over_time} />
        <ConversionChart traffic_conversions={dashboardData?.traffic_conversions} />
      </div>
    </>
  );
};

export default AffiliateUserDashboard;
