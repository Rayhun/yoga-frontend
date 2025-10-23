'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import useAuthContext from '@/hooks/useAuthContext';
import Spinner from '@/components/common/loader/Spinner';
import { getProgramsList, getDailyDoseQuickRelief } from '@/services/private/customer/program';
import { getOnboardingRecommendations } from '@/services/private/onboarding/quiz';
import { getWellnessDashboard } from '@/services/private/customer/wellness';
import queryKeys from '@/utils/query-keys';
import ChatWithAI from '@/components/common/SearchField';
import WeeklyProgressCard from '../WeeklyProgress/ProgressCard';
import QuickLearningsSection from '../QuickLearnings/QuickLearnings';
import QuickLinks from '../QuickLinks/QuickLinks';
import DonutChart from '@/components/common/DonutChart';
import { Chip } from '@mui/material';
import '@/css/animations.css';

const CustomerDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParamUtils();
  const { user } = useAuthContext();
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
  
  console.log('Recommendations Response:', recommendationsResponse?.data?.data);
  console.log('Recommended Program:', recommendedProgram);
  console.log('Daily Dose Quick Relief Response:', dailyDoseQuickReliefResponse?.data?.data);
  console.log('Wellness Dashboard Response:', wellnessDashboardResponse?.data?.data);
  console.log('Period Tracking:', periodTracking);
  console.log('Goal Tracking:', goalTracking);

  const filteredPrograms = useMemo(
    () =>
      (programsResponse?.data?.results?.data?.['all-programs'] || []).filter(program =>
        program.title.includes(searchText)
      ),
    [programsResponse?.data?.results?.data, searchText]
  );

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-12 px-8 rounded-2xl shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Your Wellness Journey</h1>
              <p className="text-green-100 text-sm">
                {user?.isEmployee 
                  ? 'Employee wellness access through your business account'
                  : user?.isBusinessOwner
                  ? 'Business owner wellness dashboard'
                  : 'Personalized wellness plans for your goals'
                }
              </p>
            </div>
            </div>
            <p className="text-green-100 text-lg leading-relaxed">
              Achieve your personal goals with curated wellness plans developed by our expert team
            </p>
            <div className="mt-8 flex justify-center md:justify-start items-center">
              {recommendedProgram ? (
                recommendedProgram.is_enroll ? (
                  <button
                    className="px-8 py-3 bg-white text-green-600 rounded-xl font-semibold text-sm hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    onClick={() => router.push(`/portal/customer/lms/program/${recommendedProgram.id}/details`)}
                  >
                    Continue Journey
                  </button>
                ) : (
                  <button
                    className="px-8 py-3 bg-white text-green-600 rounded-xl font-semibold text-sm hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    onClick={() => router.push(`/portal/customer/lms/program/${recommendedProgram.id}/details`)}
                  >
                    Start Journey
                  </button>
                )
              ) : (
                <button
                  className="px-8 py-3 bg-white text-green-600 rounded-xl font-semibold text-sm hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
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
                alt={recommendedProgram?.title || "Hero Image"}
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

      {/* Quick Action Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Log Your Cycle Card */}
        <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 rounded-2xl shadow-lg border border-pink-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-300 rounded-full blur-3xl opacity-20 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-300 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-700 transition-colors">🌸 Cycle Check-In</h3>
                <p className="text-gray-600 text-sm">1-minute tracking</p>
              </div>
            </div>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:from-pink-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => router.push('/portal/customer/checkin/tracker')}
            >
              Let’s Go →
            </button>
          </div>
        </div>

        {/* Log Your Goal Tracker Card */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-300 rounded-full blur-3xl opacity-20 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-300 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">🌼 Daily Tune-In</h3>
                <p className="text-gray-600 text-sm">Track your progress</p>
              </div>
            </div>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-sm hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => router.push('/portal/customer/checkin/sleep_tracker')}
            >
              Let’s Go →
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Wellness Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-green-25 to-emerald-25 rounded-2xl shadow-xl border border-green-50 hover-lift transition-smooth mb-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-100 via-transparent to-emerald-100"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-10 animate-float"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Header */}
        <div className="relative z-10 text-center pt-8 pb-4 animate-slideInUp">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Your Wellness Dashboard</h2>
          </div>
          <p className="text-gray-600 text-sm">Track your progress and insights</p>
          <div className="mt-3 flex justify-center">
            <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
          </div>
        </div>

        {/* Charts Container */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32 p-8">
          {isLoadingWellness ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
              <span className="ml-3 text-gray-600">Loading wellness data...</span>
            </div>
          ) : wellnessData ? (
            <>
          {/* Cycle Wellness Chart */}
          <div className="relative group animate-scaleIn" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
            <DonutChart
              value={Number(periodTracking?.wellness_score) || 0}
              maxValue={100}
              size={160}
              strokeWidth={18}
              color="#F97316"
              backgroundColor="#FED7AA"
              title={periodTracking?.tracker_name || "Cycle Wellness"}
              subtitle={`Day ${periodTracking?.current_day || 0} of ${(periodTracking?.current_day || 0) + (periodTracking?.remaining_days || 0)}`}
              centerSubtext={`Day ${periodTracking?.current_day || 0}`}
              onClick={() => router.push('/portal/customer/checkin/cycle_insights')}
              className="relative z-10 interactive-scale"
              animated={true}
            />
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-orange-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 -right-6 w-2 h-2 bg-orange-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* General Wellness Chart */}
          <div className="relative group animate-scaleIn" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
            <DonutChart
              value={Number(goalTracking?.wellness_score) || 0}
              maxValue={100}
              size={160}
              strokeWidth={18}
              color="#22C55E"
              backgroundColor="#BBF7D0"
              title={goalTracking?.tracker_title || "General Wellness"}
              subtitle={goalTracking?.overall_status || "Good"}
              centerSubtext='overall'
              onClick={() => router.push('/portal/customer/checkin/daily_insights')}
              className="relative z-10 interactive-scale"
              animated={true}
            />
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 -right-6 w-2 h-2 bg-green-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Wellness Data Available</h3>
              <p className="text-gray-500 text-sm">Start tracking your wellness to see your progress here.</p>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="relative z-10 border-t border-green-50 bg-green-25/30 px-8 py-4 rounded-b-2xl animate-slideInUp" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span>{periodTracking?.tracker_name || 'Cycle Tracking'} - {periodTracking?.overall_status || 'Good'}</span>
              </div>
              <div className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span>{goalTracking?.tracker_title || 'Daily Metrics'} - {goalTracking?.overall_status || 'Good'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Section - Above the grid */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl shadow-lg border border-emerald-100 p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">AI Wellness Assistant</h3>
            <p className="text-gray-600">Get instant personalized guidance for your wellness journey</p>
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

      {/* Content Cards Section - Centered 2 Cards */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          
          {/* 1. Daily Dose Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-green-600 text-xl">☀️</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Daily Dose</h3>
                  <p className="text-gray-600 text-sm">Your daily wellness routine</p>
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
                  <span className="text-gray-400 text-2xl">☀️</span>
                </div>
                <p className="text-gray-500">No daily dose available</p>
              </div>
            )}
          </div>

          {/* 2. Quick Relief Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-orange-600 text-xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">Quick Relief</h3>
                  <p className="text-gray-600 text-sm">Fast wellness solutions</p>
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
                  <span className="text-gray-400 text-2xl">⚡</span>
                </div>
                <p className="text-gray-500">No quick relief available</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Quick Links Section - After the grid */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl shadow-lg border border-teal-100 p-8 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Quick Links</h3>
            <p className="text-gray-600">Navigate to key features and wellness tools</p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <QuickLinks />
          </div>
        </div>
      </div>

      {/* Live Sessions Section - Full Width */}
      {/* <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
              <span className="text-purple-600 text-xl">🎯</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Live Sessions</h3>
              <p className="text-gray-600 text-sm">Join live wellness sessions</p>
            </div>
          </div>
        </div>
        {isLoadingPrograms ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <QuickLearningsSection items={filteredPrograms} title={''} viewAllLink={'/portal'} />
        )}
      </div> */}
    </div>
  );
};

export default CustomerDashboard;
