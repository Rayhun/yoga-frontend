'use client';
/**
 * @deprecated Legacy expert dashboard (LMS /expert/dashboard/).
 * Teacher home now uses `@/components/expert/HomeDashboard` + GET /api/v2/expert/dashboard/.
 * Kept for reference only — not mounted by the teacher dashboard page.
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import CardDataStats from '../../stats/CardDataStats';
import { FiDollarSign, FiUsers, FiTrendingUp, FiBookOpen } from 'react-icons/fi';
import { TbTarget } from 'react-icons/tb';
import { HiOutlineChartBar } from 'react-icons/hi';
// import { PiHandshake } from 'react-icons/pi';
import { getExpertDashboard } from '@/services/private/expert/dashboard';
import queryKeys from '@/utils/query-keys';
import { useQuery } from '@tanstack/react-query';
import PageLoader from '@/components/common/loader/PageLoader';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PeriodFilter from '../AdminDashboard/PeriodFilter';

// Dynamic imports to prevent SSR issues
const PersonalEarningsChart = dynamic(() => import('./PersonalEarningsChart'), { ssr: false });
const EnrollmentAnalyticsChart = dynamic(() => import('./EnrollmentAnalyticsChart'), { ssr: false });
const StudentEngagementChart = dynamic(() => import('./StudentEngagementChart'), { ssr: false });
const PerformanceBenchmark = dynamic(() => import('./PerformanceBenchmark'), { ssr: false });

const ExpertDashboard = () => {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with Filter */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white portal-hero rounded-2xl shadow-2xl mb-6 relative">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <HiOutlineChartBar className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Dashboard Overview
                </h1>
              </div>
              <p className="text-sm sm:text-base text-white/90 ml-0 sm:ml-[60px] font-medium">
                Track your performance and earnings at a glance
              </p>
            </div>
            <div className="flex-shrink-0">
              <PeriodFilter />
            </div>
          </div>
        </div>
      </div>

      {/* Earnings cards + info (info always directly under the two earnings boxes) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <CardDataStats 
            title="Total Earnings Paid" 
            total={`$${dashboardData?.earnings_analytics?.total_earnings || 0}`}
            gradient="from-emerald-500 to-teal-600"
            iconBg="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30"
          >
            <FiDollarSign className="text-emerald-600 dark:text-emerald-400" />
          </CardDataStats>
          
          <CardDataStats 
            title="Estimated Earnings (Processing)  " 
            total={`$${dashboardData?.earnings_analytics?.pending_earnings || 0}`}
            gradient="from-amber-500 to-orange-600"
            iconBg="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30"
          >
            <FiTrendingUp className="text-amber-600 dark:text-amber-400" />
          </CardDataStats>
          <CardDataStats 
          title="Total Guided Experiences" 
          total={dashboardData?.content_analytics?.total_events || 0}
          onClick={() => router.push('/portal/teacher/profile?active_tab=group_coaching')}
          gradient="from-violet-500 to-purple-600"
          iconBg="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30"
        >
          <TbTarget className="text-violet-600 dark:text-violet-400" />
        </CardDataStats>
        </div>

        <div
          className="rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-4 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30"
          role="note"
        >
          <div className="flex gap-3 text-sm leading-relaxed text-amber-950/90 dark:text-amber-100/90">
            <span className="shrink-0 select-none" aria-hidden>
              📌
            </span>
            <div className="space-y-2">
              <p>
                Earnings are calculated on the net transaction amount after taxes, refunds, and
                third-party payment fees.
              </p>
              <p>
                Third-party fees include payment processing (Stripe), payout processing (PayPal), and
                currency conversion where applicable. These are estimated using a blended rate (e.g., ~7%)
                and may vary slightly by transaction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Other stats */}
      {/* <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <CardDataStats 
          title="Total Guided Experiences" 
          total={dashboardData?.content_analytics?.total_events || 0}
          onClick={() => router.push('/portal/teacher/profile?active_tab=group_coaching')}
          gradient="from-violet-500 to-purple-600"
          iconBg="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30"
        >
          <TbTarget className="text-violet-600 dark:text-violet-400" />
        </CardDataStats> */}
        
        {/* <CardDataStats 
          title="Total Enrollments" 
          total={dashboardData?.enrollment_analytics?.total_enrollments || 0}
          gradient="from-blue-500 to-indigo-600"
          iconBg="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30"
        >
          <FiBookOpen className="text-blue-600 dark:text-blue-400" />
        </CardDataStats> */}
        
        {/* <CardDataStats 
          title="Unique Students" 
          total={dashboardData?.student_analytics?.unique_students || 0}
          gradient="from-purple-500 to-pink-600"
          iconBg="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
        >
          <FiUsers className="text-purple-600 dark:text-purple-400" />
        </CardDataStats> */}
      {/* </div> */}
       {/* <CardDataStats 
          title="Total Programs" 
          total={dashboardData?.content_analytics?.total_programs || 0}
          gradient="from-cyan-500 to-blue-600"
          iconBg="bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30"
        >
          <TbChartLine className="text-cyan-600 dark:text-cyan-400" />
        </CardDataStats>
        
        <CardDataStats 
          title="Total Guided Experiences" 
          total={dashboardData?.content_analytics?.total_events || 0}
          onClick={() => router.push('/portal/teacher/profile?active_tab=group_coaching')}
          gradient="from-violet-500 to-purple-600"
          iconBg="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30"
        >
          <TbTarget className="text-violet-600 dark:text-violet-400" />
        </CardDataStats>
        
        <CardDataStats 
          title="Completion Rate" 
          total={`${dashboardData?.content_analytics?.completion_rate || 0}%`}
          gradient="from-rose-500 to-pink-600"
          iconBg="bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30"
        >
          <FiUsers className="text-rose-600 dark:text-rose-400" />
        </CardDataStats>
      </div> */}

      {/* Charts Section */}
      {/* {isClient && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="rounded-xl border border-gray-200/50 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800/50">
                <PersonalEarningsChart 
                  earningsData={dashboardData?.earnings_analytics?.monthly_earnings}
                  earningsBySection={dashboardData?.earnings_analytics?.earnings_by_section}
                />
              </div>
            </div>
            
            <div className="lg:col-span-4">
              <div className="rounded-xl border border-gray-200/50 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800/50">
                <EnrollmentAnalyticsChart 
                  enrollmentData={dashboardData?.enrollment_analytics?.enrollment_growth}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="rounded-xl border border-gray-200/50 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800/50">
                <StudentEngagementChart 
                  studentData={dashboardData?.student_analytics}
                  progressRecords={dashboardData?.student_analytics?.progress_records_count}
                />
              </div>
            </div>
            
            <div className="lg:col-span-6">
              <div className="rounded-xl border border-gray-200/50 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800/50">
                <PerformanceBenchmark 
                  contentData={dashboardData?.content_analytics}
                  enrollmentData={dashboardData?.enrollment_analytics}
                />
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ExpertDashboard;
