'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiUsers, FiDollarSign, FiTrendingUp, FiBookOpen } from 'react-icons/fi';
import ChartOne from '../../charts/ChartOne';
import ChartTwo from '../../charts/ChartTwo';
import CardDataStats from '../../stats/CardDataStats';
import { getAdminDashboardHome } from '@/services/private/expert/dashboard';
import queryKeys from '@/utils/query-keys';
import PageLoader from '@/components/common/loader/PageLoader';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';

const ECommerce = () => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getAdminDashboardHome(),
    queryKey: [queryKeys.adminDashboardHome],
  });

  const dashboardData = response?.data?.data;

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  // Format currency values
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format numbers with K, M suffixes
  const formatNumber = (value) => {
    if (!value && value !== 0) return '0';
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  // Calculate growth rate (placeholder - you can enhance this with actual comparison)
  const calculateGrowthRate = (current, previous) => {
    if (!previous || previous === 0) return null;
    const rate = ((current - previous) / previous) * 100;
    return rate.toFixed(2) + '%';
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats 
          title="Total Revenue" 
          total={formatCurrency(dashboardData?.revenue_statistics?.total_revenue)}
          rate={calculateGrowthRate(
            dashboardData?.revenue_statistics?.total_revenue || 0,
            dashboardData?.revenue_statistics?.total_revenue || 0
          )}
          levelUp={dashboardData?.revenue_statistics?.total_revenue > 0}
        >
          <FiDollarSign className="text-primary" size={20} />
        </CardDataStats>

        <CardDataStats 
          title="Total Users" 
          total={formatNumber(dashboardData?.user_statistics?.total_users)}
          rate={calculateGrowthRate(
            dashboardData?.growth_metrics?.new_users || 0,
            dashboardData?.growth_metrics?.new_users || 0
          )}
          levelUp={dashboardData?.growth_metrics?.new_users > 0}
        >
          <FiUsers className="text-primary" size={20} />
        </CardDataStats>

        <CardDataStats 
          title="Total Programs" 
          total={formatNumber(dashboardData?.content_statistics?.total_programs)}
          rate={calculateGrowthRate(
            dashboardData?.growth_metrics?.new_programs || 0,
            dashboardData?.growth_metrics?.new_programs || 0
          )}
          levelUp={dashboardData?.growth_metrics?.new_programs > 0}
        >
          <FiBookOpen className="text-primary" size={20} />
        </CardDataStats>

        <CardDataStats 
          title="Active Subscriptions" 
          total={formatNumber(dashboardData?.subscription_statistics?.active_subscriptions)}
          rate={calculateGrowthRate(
            dashboardData?.growth_metrics?.new_subscriptions || 0,
            dashboardData?.growth_metrics?.new_subscriptions || 0
          )}
          levelUp={dashboardData?.growth_metrics?.new_subscriptions > 0}
        >
          <FiTrendingUp className="text-primary" size={20} />
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne 
          monthlyRevenue={dashboardData?.revenue_statistics?.monthly_revenue}
          enrollmentGrowth={dashboardData?.enrollment_statistics?.enrollment_growth}
        />
        <ChartTwo 
          contentStats={dashboardData?.content_statistics}
          enrollmentStats={dashboardData?.enrollment_statistics}
        />
      </div>
    </>
  );
};

export default ECommerce;
