'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import CardDataStats from '../../stats/CardDataStats';
import { FiDollarSign, FiUsers, FiTrendingUp, FiBookOpen } from 'react-icons/fi';
import { TbChartLine, TbTarget } from 'react-icons/tb';
import { PiHandshake } from 'react-icons/pi';
import { getExpertDashboard } from '@/services/private/expert/dashboard';
import queryKeys from '@/utils/query-keys';
import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PersonalEarningsChart from './PersonalEarningsChart';
import EnrollmentAnalyticsChart from './EnrollmentAnalyticsChart';
import StudentEngagementChart from './StudentEngagementChart';
import PerformanceBenchmark from './PerformanceBenchmark';
import PeriodFilter from '../AdminDashboard/PeriodFilter';

const ExpertDashboard = () => {
  const searchParams = useSearchParams();
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getExpertDashboard({ start_date: startDate, end_date: endDate }),
    queryKey: [queryKeys.expertDashboard, startDate, endDate],
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
          title="Total Earnings" 
          total={`$${dashboardData?.earnings_analytics?.total_earnings}`}
        >
          <FiDollarSign className="text-primary" size={20} />
        </CardDataStats>
        
        <CardDataStats 
          title="Pending Earnings" 
          total={`$${dashboardData?.earnings_analytics?.pending_earnings}`}
        >
          <FiTrendingUp className="text-primary" size={20} />
        </CardDataStats>
        
        <CardDataStats 
          title="Total Enrollments" 
          total={dashboardData?.enrollment_analytics?.total_enrollments}
        >
          <FiBookOpen className="text-primary" size={20} />
        </CardDataStats>
        
        <CardDataStats 
          title="Unique Students" 
          total={dashboardData?.student_analytics?.unique_students}
        >
          <FiUsers className="text-primary" size={20} />
        </CardDataStats>
      </div>

      {/* Secondary Stats Cards */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats 
          title="Total Programs" 
          total={dashboardData?.content_analytics?.total_programs}
        >
          <TbChartLine className="text-primary" size={20} />
        </CardDataStats>
        
        <CardDataStats 
          title="Total Events" 
          total={dashboardData?.content_analytics?.total_events}
        >
          <TbTarget className="text-primary" size={20} />
        </CardDataStats>
        
        <CardDataStats 
          title="Total Consultations" 
          total={dashboardData?.content_analytics?.total_consultations}
        >
          <PiHandshake className="text-primary" size={20} />
        </CardDataStats>
        
        <CardDataStats 
          title="Completion Rate" 
          total={`${dashboardData?.content_analytics?.completion_rate}%`}
        >
          <FiUsers className="text-primary" size={20} />
        </CardDataStats>
      </div>

      {/* Charts Section */}
      <div className="mt-7.5 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-8">
          <PersonalEarningsChart 
            earningsData={dashboardData?.earnings_analytics?.monthly_earnings}
            earningsBySection={dashboardData?.earnings_analytics?.earnings_by_section}
          />
        </div>
        
        <div className="col-span-12 xl:col-span-4">
          <EnrollmentAnalyticsChart 
            enrollmentData={dashboardData?.enrollment_analytics?.enrollment_growth}
          />
        </div>
      </div>

      <div className="mt-7.5 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-6">
          <StudentEngagementChart 
            studentData={dashboardData?.student_analytics}
            progressRecords={dashboardData?.student_analytics?.progress_records_count}
          />
        </div>
        
        <div className="col-span-12 xl:col-span-6">
          <PerformanceBenchmark 
            contentData={dashboardData?.content_analytics}
            enrollmentData={dashboardData?.enrollment_analytics}
          />
        </div>
      </div>
    </>
  );
};

export default ExpertDashboard;
