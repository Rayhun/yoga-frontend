'use client';

import React from 'react';
import dayjs from 'dayjs';
import { MdOutlineDateRange } from 'react-icons/md';
import { PiChartLine } from 'react-icons/pi';
import { PiLightningLight } from 'react-icons/pi';
import WellnessStats from '../dailyInsights/Stats';
import KeyInsights from '../dailyInsights/KeyInsights';
import StatisticsInfoButton from '../dailyInsights/StatisticsInfoButton';
import { CYCLE_STATISTICS_HELP_DEFAULT } from '../dailyInsights/insightStatisticsDefaults';
import { getCycleInsights, getInsightStatisticsHelp } from '@/services/private/customer/goal';
import queryKeys from '@/utils/query-keys';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import { useQuery } from '@tanstack/react-query';

const Section = ({ children, className = "" }) => (
  <div className={`bg-white portal-section rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${className}`}>
    <div>{children}</div>
  </div>
);

const CycleDayInfo = ({ progressDaysMsg }) => {
  if (!progressDaysMsg) return null;
  
  let dayInfo;
  try {
    dayInfo = JSON.parse(progressDaysMsg);
  } catch (e) {
    return null;
  }

  return (
    <Section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 text-sm">🌙</span>
          </div>
          Today&apos;s Cycle Insight
        </h2>
        <p className="text-gray-600">Your personalized cycle guidance for today.</p>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex flex-col items-center justify-center text-white">
            <span className="text-xs font-medium">Day</span>
            <span className="text-xl font-bold">{dayInfo.Day}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{dayInfo.Title}</h3>
            <p className="text-purple-600 font-medium">{dayInfo.Phase} Phase</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Hormone Profile</h4>
              <p className="text-sm text-gray-600">{dayInfo.HormoneProfile}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Energy Forecast</h4>
              <p className="text-sm text-gray-600">{dayInfo.EnergyForecast}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Nutrition Focus</h4>
              <p className="text-sm text-gray-600">{dayInfo.NutritionFocus}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Movement Suggestion</h4>
              <p className="text-sm text-gray-600">{dayInfo.MovementSuggestion}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Work Life Strategy</h4>
              <p className="text-sm text-gray-600">{dayInfo.WorkLifeStrategy}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Self Care Tip</h4>
              <p className="text-sm text-gray-600">{dayInfo.SelfCareTip}</p>
            </div>
          </div>
        </div>
        
        {dayInfo.TomorrowPreview && (
          <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-gray-800 mb-1">Tomorrow Preview</h4>
            <p className="text-sm text-gray-600">{dayInfo.TomorrowPreview}</p>
          </div>
        )}
      </div>
    </Section>
  );
};

const CycleInsights = () => {
  const { isFetching, data: insights } = useQuery({
    queryFn: () => getCycleInsights(),
    queryKey: ['cycleInsights'],
  });

  const { data: helpResponse } = useQuery({
    queryFn: () => getInsightStatisticsHelp('cycle'),
    queryKey: ['insightStatisticsHelp', 'cycle'],
  });

  const insightsData = insights?.data?.data;
  const cycleHelp = helpResponse?.data?.data?.cycle ?? CYCLE_STATISTICS_HELP_DEFAULT;
  const hasData = Boolean(insightsData);

  if (!isFetching && !insightsData) {
    return (
      <div className="max-w-6xl mx-auto p-6 min-h-screen">
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-8 px-6 rounded-2xl shadow-2xl mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10" />
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center text-xl gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <PiChartLine size={24} />
              </div>
              <div>
                <h1 className="font-bold text-2xl">Cycle Insights</h1>
                <p className="text-green-100 text-sm">Your cycle analytics and patterns</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-300 text-lg font-bold">
                <PiLightningLight size={24} className="animate-pulse" />
                <span>Live Analytics</span>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-4 py-2 mt-2">
                <div className="flex items-center gap-2 text-green-100 text-sm">
                  <MdOutlineDateRange size={18} />
                  <span>{dayjs().format('ddd, MMM DD, YYYY')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Section>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">📊</span>
                </div>
                {cycleHelp?.title || 'Cycle Statistics'}
              </h2>
              <p className="text-gray-600">Your current cycle metrics and trends.</p>
            </div>
            <StatisticsInfoButton
              helpContent={cycleHelp}
              hasData={false}
              insightType="cycle"
            />
          </div>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h3>
            <p className="text-gray-600">Start tracking your cycle to see insights here.</p>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-8 px-6 rounded-2xl shadow-2xl mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center text-xl gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <PiChartLine size={24} />
              </div>
              <div>
                <h1 className="font-bold text-2xl">Cycle Insights</h1>
                <p className="text-green-100 text-sm">Your cycle analytics and patterns</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-300 text-lg font-bold">
                <PiLightningLight size={24} className="animate-pulse" />
                <span>Live Analytics</span>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-4 py-2 mt-2">
                <div className="flex items-center gap-2 text-green-100 text-sm">
                  <MdOutlineDateRange size={18} />
                  <span>{dayjs().format('ddd, MMM DD, YYYY')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-8">
          <Section>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">📊</span>
                  </div>
                  {cycleHelp?.title || 'Cycle Statistics'}
                </h2>
                <p className="text-gray-600">Your current cycle metrics and trends.</p>
              </div>
              <StatisticsInfoButton helpContent={cycleHelp} hasData={hasData} insightType="cycle" />
            </div>
            <LoadingWrapper isLoading={isFetching}>
              <WellnessStats
                wellnessScore={insightsData?.wellness_score}
                average={insightsData?.average}
                latestTrend={insightsData?.latest_trend}
              />
            </LoadingWrapper>
          </Section>

          <LoadingWrapper isLoading={isFetching}>
            <CycleDayInfo progressDaysMsg={insightsData?.progress_days_msg} />
          </LoadingWrapper>
          
          {/* <Section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 text-sm">📈</span>
                </div>
                Monthly Patterns
              </h2>
              <p className="text-gray-600">Track your cycle patterns over time.</p>
            </div>
            <MonthlyPatternsChart data={insightsData?.daily_patterns} />
          </Section> */}
          
          <Section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 text-sm">💡</span>
                </div>
                Key Insights
              </h2>
              <p className="text-gray-600">Personalized insights based on your cycle data.</p>
            </div>
            <LoadingWrapper isLoading={isFetching}>
              <KeyInsights insights={insightsData?.insight_data} />
            </LoadingWrapper>
          </Section>

          {/* <Section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 text-sm">🎯</span>
                </div>
                Your Weekly Wellness Reflection
              </h2>
              <p className="text-gray-600">AI-powered recommendations based on your cycle.</p>
            </div>
            <AiInsightCard insight="cycle" />
          </Section> */}
        </div>

        {/* Additional Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">📊</span>
              </div>
              <h3 className="font-bold text-gray-800">Track Progress</h3>
            </div>
            <p className="text-gray-600 text-sm">Monitor your cycle journey with detailed analytics and visual patterns.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-lg">🎯</span>
              </div>
              <h3 className="font-bold text-gray-800">Identify Trends</h3>
            </div>
            <p className="text-gray-600 text-sm">Discover patterns in your cycle data to make informed decisions.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 text-lg">💡</span>
              </div>
              <h3 className="font-bold text-gray-800">Get Insights</h3>
            </div>
            <p className="text-gray-600 text-sm">Receive personalized recommendations based on your cycle patterns.</p>
          </div>
        </div>
    </div>
  );
};

export default CycleInsights;
