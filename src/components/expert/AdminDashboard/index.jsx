'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import CardDataStats from '../../stats/CardDataStats';
import { FiUsers, FiDollarSign, FiTrendingUp, FiBookOpen } from 'react-icons/fi';
import { TbUsersGroup, TbChartLine } from 'react-icons/tb';
import { PiHandshake } from 'react-icons/pi';
import { getAdminExpertDashboard } from '@/services/private/expert/dashboard';
import queryKeys from '@/utils/query-keys';
import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import ExpertAnalyticsChart from './ExpertAnalyticsChart';
import RevenueChart from './RevenueChart';
import ContentPopularityChart from './ContentPopularityChart';
import ExpertPerformanceTable from './ExpertPerformanceTable';
import PeriodFilter from './PeriodFilter';

const AdminExpertDashboard = () => {
  const searchParams = useSearchParams();
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getAdminExpertDashboard({ start_date: startDate, end_date: endDate }),
    queryKey: [queryKeys.adminExpertDashboard, startDate, endDate],
    enabled: !!(startDate && endDate), // Only run query when we have both dates
  });

  const dashboardData = response?.data?.data;

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <>
      {/* Header with Filter */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Dashboard Overview
        </h1>
        <PeriodFilter />
      </div>
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats 
          title="Total Experts" 
          total={dashboardData?.expert_analytics?.total_experts}
        >
          <FiUsers className="text-primary" size={20} />
        </CardDataStats>
        
        <CardDataStats 
          title="Active Experts" 
          total={dashboardData?.expert_analytics?.active_experts}
        >
          <TbUsersGroup className="text-primary" size={20} />
        </CardDataStats>
        
        <CardDataStats 
          title="Total Revenue" 
          total={`$${dashboardData?.expert_revenue_analytics?.total_expert_revenue}`}
        >
          <FiDollarSign className="text-primary" size={20} />
        </CardDataStats>
        
        <CardDataStats 
          title="Pending Payments" 
          total={dashboardData?.expert_revenue_analytics?.pending_expert_payments}
        >
          <FiTrendingUp className="text-primary" size={20} />
        </CardDataStats>
      </div>

      {/* Secondary Stats Cards */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats 
          title="Total Programs" 
          total={dashboardData?.expert_content_analytics?.total_expert_programs}
        >
          <FiBookOpen className="text-primary" size={20} />
        </CardDataStats>
        
        <CardDataStats 
          title="Total Events" 
          total={dashboardData?.expert_content_analytics?.total_expert_events}
        >
          <TbChartLine className="text-primary" size={20} />
        </CardDataStats>
        
        <CardDataStats 
          title="Total Consultations" 
          total={dashboardData?.expert_content_analytics?.total_expert_consultations}
        >
          <PiHandshake className="text-primary" size={20} />
        </CardDataStats>
        
        <CardDataStats 
          title="Avg Completion Rate" 
          total={`${dashboardData?.expert_performance_analytics?.avg_completion_rate}%`}
        >
          <FiTrendingUp className="text-primary" size={20} />
        </CardDataStats>
      </div>

      {/* Charts Section */}
      <div className="mt-7.5 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-8">
          <ExpertAnalyticsChart 
            expertGrowthData={dashboardData?.expert_analytics?.expert_growth}
            contentCreationData={dashboardData?.expert_content_analytics?.expert_content_creation}
          />
        </div>
        
        <div className="col-span-12 xl:col-span-4">
          <RevenueChart revenueData={dashboardData?.expert_revenue_analytics?.monthly_expert_revenue} />
        </div>
      </div>

      <div className="mt-7.5 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-6">
          <ContentPopularityChart 
            contentData={dashboardData?.expert_content_analytics?.top_expert_programs}
          />
        </div>
        
        <div className="col-span-12 xl:col-span-6">
          <ExpertPerformanceTable 
            expertData={dashboardData?.expert_performance_analytics?.expert_completion_rates}
          />
        </div>
      </div>
    </>
  );
};

export default AdminExpertDashboard;
