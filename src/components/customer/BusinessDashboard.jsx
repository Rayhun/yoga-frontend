'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Spinner from '@/components/common/loader/Spinner';
import { getProgramsList, getDailyDoseQuickRelief } from '@/services/private/customer/program';
import { getOnboardingRecommendations } from '@/services/private/onboarding/quiz';
import { getWellnessDashboard } from '@/services/private/customer/wellness';
import queryKeys from '@/utils/query-keys';
import ChatWithAI from '@/components/common/SearchField';
import WeeklyProgressCard from '@/components/dashboard/WeeklyProgress/ProgressCard';
import QuickLearningsSection from '@/components/dashboard/QuickLearnings/QuickLearnings';
import QuickLinks from '@/components/dashboard/QuickLinks/QuickLinks';
import DonutChart from '@/components/common/DonutChart';
import { Chip } from '@mui/material';
import '@/css/animations.css';

const BusinessDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParamUtils();
  const selectedCategory = searchParams.get('category');
  const [searchText, setSearchText] = useState('');
  
  const { isFetching: isLoadingPrograms, data: programsResponse } = useQuery({
    queryFn: () => getProgramsList({ categories: selectedCategory }),
    queryKey: [queryKeys.customerPrograms, selectedCategory],
  });

  const { data: recommendationsResponse } = useQuery({
    queryFn: getOnboardingRecommendations,
    queryKey: [queryKeys.onboardingRecommendations],
  });

  const { data: dailyDoseQuickReliefResponse } = useQuery({
    queryFn: getDailyDoseQuickRelief,
    queryKey: [queryKeys.dailyDoseQuickRelief],
  });

  const { data: wellnessDashboardResponse, isLoading: isLoadingWellness } = useQuery({
    queryFn: getWellnessDashboard,
    queryKey: [queryKeys.wellnessDashboard],
  });

  const recommendedProgram = recommendationsResponse?.data?.data?.recommended_programs;
  const userInterests = recommendationsResponse?.data?.data?.user_interests || [];
  
  const dailyDoseProgram = dailyDoseQuickReliefResponse?.data?.data?.daily_dose_program;
  const quickReliefProgram = dailyDoseQuickReliefResponse?.data?.data?.quick_relief_program;
  
  const wellnessData = wellnessDashboardResponse?.data?.data;
  const periodTracking = wellnessData?.period_tracking;
  const goalTracking = wellnessData?.goal_tracking;

  const filteredPrograms = useMemo(
    () =>
      (programsResponse?.data?.results?.data?.['all-programs'] || []).filter(program =>
        program.title.includes(searchText)
      ),
    [programsResponse?.data?.results?.data, searchText]
  );

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      {/* Business Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-12 px-8 rounded-2xl shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Business Wellness Dashboard</h1>
                <p className="text-blue-100 text-sm">Comprehensive wellness solutions for your organization</p>
              </div>
            </div>
            <p className="text-blue-100 text-lg leading-relaxed">
              Manage your team's wellness journey with advanced analytics, program management, and organizational insights
            </p>
            <div className="mt-8 flex justify-center md:justify-start items-center">
              {recommendedProgram ? (
                recommendedProgram.is_enroll ? (
                  <button
                    className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    onClick={() => router.push(`/portal/customer/lms/program/${recommendedProgram.id}/details`)}
                  >
                    Continue Program
                  </button>
                ) : (
                  <button
                    className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    onClick={() => router.push(`/portal/customer/lms/program/${recommendedProgram.id}/details`)}
                  >
                    Start Program
                  </button>
                )
              ) : (
                <button
                  className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  onClick={() => router.push('/portal/customer/lms/program')}
                >
                  Browse Programs
                </button>
              )}
            </div>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0 aspect-[16/9]">
            <div className="relative">
              <Image
                src={recommendedProgram?.image || "/images/content/default.png"}
                alt={recommendedProgram?.title || "Business Hero Image"}
                width={0}
                height={0}
                sizes="100vw"
                className="w-full rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Team Wellness Overview */}
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-300 rounded-full blur-3xl opacity-20 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-300 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">Team Wellness</h3>
                <p className="text-gray-600 text-sm">Overall team health score</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
              <div className="text-sm text-gray-600">Above average</div>
            </div>
          </div>
        </div>

        {/* Program Engagement */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-300 rounded-full blur-3xl opacity-20 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-300 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">Engagement</h3>
                <p className="text-gray-600 text-sm">Program participation rate</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">72%</div>
              <div className="text-sm text-gray-600">Active participation</div>
            </div>
          </div>
        </div>

        {/* ROI Metrics */}
        <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-2xl shadow-lg border border-orange-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-300 rounded-full blur-3xl opacity-20 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-300 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors">ROI</h3>
                <p className="text-gray-600 text-sm">Wellness program return</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">3.2x</div>
              <div className="text-sm text-gray-600">Investment return</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Business Analytics Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-25 to-indigo-25 rounded-2xl shadow-xl border border-blue-50 hover-lift transition-smooth mb-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100 via-transparent to-indigo-100"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-10 animate-float"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Header */}
        <div className="relative z-10 text-center pt-8 pb-4 animate-slideInUp">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Business Analytics Dashboard</h2>
          </div>
          <p className="text-gray-600 text-sm">Comprehensive insights for organizational wellness</p>
          <div className="mt-3 flex justify-center">
            <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
          </div>
        </div>

        {/* Charts Container */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32 p-8">
          {isLoadingWellness ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
              <span className="ml-3 text-gray-600">Loading analytics data...</span>
            </div>
          ) : wellnessData ? (
            <>
          {/* Team Wellness Chart */}
          <div className="relative group animate-scaleIn" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
            <DonutChart
              value={Number(goalTracking?.wellness_score) || 0}
              maxValue={100}
              size={160}
              strokeWidth={18}
              color="#22C55E"
              backgroundColor="#BBF7D0"
              title="Team Wellness"
              subtitle="Overall Health Score"
              centerSubtext="85%"
              onClick={() => router.push('/portal/customer/checkin/daily_insights')}
              className="relative z-10 interactive-scale"
              animated={true}
            />
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 -right-6 w-2 h-2 bg-green-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* Program Engagement Chart */}
          <div className="relative group animate-scaleIn" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
            <DonutChart
              value={Number(periodTracking?.wellness_score) || 0}
              maxValue={100}
              size={160}
              strokeWidth={18}
              color="#3B82F6"
              backgroundColor="#DBEAFE"
              title="Engagement"
              subtitle="Program Participation"
              centerSubtext="72%"
              onClick={() => router.push('/portal/customer/checkin/cycle_insights')}
              className="relative z-10 interactive-scale"
              animated={true}
            />
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 -right-6 w-2 h-2 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Analytics Data Available</h3>
              <p className="text-gray-500 text-sm">Start using wellness programs to see your business analytics here.</p>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="relative z-10 border-t border-blue-50 bg-blue-25/30 px-8 py-4 rounded-b-2xl animate-slideInUp" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Team Wellness - 85%</span>
              </div>
              <div className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span>Program Engagement - 72%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Business Assistant Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-lg border border-indigo-100 p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">AI Business Assistant</h3>
            <p className="text-gray-600">Get strategic insights and recommendations for your organization's wellness program</p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <div className="relative">
              <ChatWithAI />
            </div>
          </div>
        </div>
      </div>

      {/* Business Program Management Section */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          
          {/* 1. Corporate Programs Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-blue-600 text-xl">🏢</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Corporate Programs</h3>
                  <p className="text-gray-600 text-sm">Enterprise wellness solutions</p>
                </div>
              </div>
            </div>
            {dailyDoseProgram ? (
              <div className="space-y-4">
                <QuickLearningsSection items={[dailyDoseProgram]} title={''} />
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">🏢</span>
                </div>
                <p className="text-gray-500">No corporate programs available</p>
              </div>
            )}
          </div>

          {/* 2. Team Building Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-purple-600 text-xl">👥</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Team Building</h3>
                  <p className="text-gray-600 text-sm">Collaborative wellness activities</p>
                </div>
              </div>
            </div>
            {quickReliefProgram ? (
              <div className="space-y-4">
                <QuickLearningsSection items={[quickReliefProgram]} title={''} />
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">👥</span>
                </div>
                <p className="text-gray-500">No team building programs available</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Business Quick Links Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-100 p-8 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Business Quick Links</h3>
            <p className="text-gray-600">Access key business features and management tools</p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <QuickLinks />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
