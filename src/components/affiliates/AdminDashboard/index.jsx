'use client';
import React from 'react';
import ChartOne from '../../charts/ChartOne';
import ChartTwo from '../../charts/ChartTwo';
import CardDataStats from '../../stats/CardDataStats';
import { FiUserCheck, FiDollarSign } from 'react-icons/fi';
import { TbUsers } from 'react-icons/tb';
import { TbUsersGroup } from 'react-icons/tb';
import { getAffiliatesUsersAdminDashboard } from '@/services/private/affiliates/dashboard';
import queryKeys from '@/utils/query-keys';
import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import EarningChart from '../EarningChart';

const AdminAffiliatedDashboard = () => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getAffiliatesUsersAdminDashboard(),
    queryKey: [queryKeys.affiliatesUsersAdminDashboard],
  });

  const dashboardData = response?.data?.data;

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats title="Total Affiliates" total={dashboardData?.total_affiliates}>
          <TbUsers className="text-primary" size={20} />
        </CardDataStats>
        <CardDataStats title="Active Affiliates" total={dashboardData?.approved_affiliates}>
          <FiUserCheck className="text-primary" size={20} />
        </CardDataStats>
        <CardDataStats
          title="Total Commission Paid"
          total={dashboardData?.total_commission_paid}
          // rate="+ $3,200"
          // highlight="+$3200 this month"
          // levelUp
        >
          <FiDollarSign className="text-primary" size={20} />
        </CardDataStats>
        <CardDataStats title="Total Refferrals" total={dashboardData?.total_referral_signups}>
          <TbUsersGroup className="text-primary" size={20} />
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <EarningChart earnings_over_time={dashboardData?.earnings_over_time} />
        <ChartTwo />
      </div>
    </>
  );
};

export default AdminAffiliatedDashboard;
