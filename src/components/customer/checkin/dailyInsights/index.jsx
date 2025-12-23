'use client';

import React, { useState } from 'react';
import dayjs from 'dayjs';
import { MdOutlineDateRange } from 'react-icons/md';
import { PiChartLine } from 'react-icons/pi';
import { PiLightningLight } from 'react-icons/pi';
import WellnessStats from './Stats';
import MonthlyPatternsChart from './Chart';
import KeyInsights from './KeyInsights';
import { getDailyInsights } from '@/services/private/customer/goal';
import queryKeys from '@/utils/query-keys';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import { useQuery } from '@tanstack/react-query';

const Section = ({ children, className = "" }) => (
  <div className={`bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${className}`}>
    <div>{children}</div>
  </div>
);

const DailyInsights = () => {
  const [infoOpen, setInfoOpen] = useState(false);
  const { isFetching, data: insights } = useQuery({
    queryFn: () => getDailyInsights(),
    queryKey: [queryKeys.dailyInsight],
  });

  const insightsData = insights?.data?.data

  if(!isFetching && !insightsData) return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center relative">
        {/* Info Button - Top Right */}
        <div className="absolute top-4 right-4">
          <button
            type="button"
            aria-label="Insights info"
            onClick={() => setInfoOpen((prev) => !prev)}
            className="w-7 h-7 rounded-full border border-gray-200 bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          </button>
        </div>
        {infoOpen && (
          <div className="absolute top-12 right-4 mt-2 w-64 bg-white border border-emerald-100 rounded-xl shadow-xl p-3 z-20">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                i
              </div>
              <div className="text-sm font-semibold text-gray-800 leading-snug">
                Track 5 days to see your insights ✨
              </div>
              <button
                type="button"
                aria-label="Close insight info"
                onClick={() => setInfoOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-gray-400 text-2xl">📊</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h3>
        <p className="text-gray-600">Start tracking your wellness to see insights here.</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <LoadingWrapper isLoading={isFetching}>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-8 px-6 rounded-2xl shadow-2xl mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center text-xl gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <PiChartLine size={24} />
              </div>
              <div>
                <h1 className="font-bold text-2xl">Wellness Insights</h1>
                <p className="text-green-100 text-sm">Your daily wellness analytics and patterns</p>
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
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">📊</span>
                </div>
                Wellness Statistics
              </h2>
              <p className="text-gray-600">Your current wellness metrics and trends.</p>
            </div>
            <WellnessStats
              wellnessScore={insightsData?.wellness_score}
              average={insightsData?.average}
              latestTrend={insightsData?.latest_trend}
            />
          </Section>
          
          {/* <Section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 text-sm">📈</span>
                </div>
                Monthly Patterns
              </h2>
              <p className="text-gray-600">Track your wellness patterns over time.</p>
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
              <p className="text-gray-600">Personalized insights based on your data.</p>
            </div>
            <KeyInsights insights={insightsData?.insight_data} />
          </Section>

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
            <p className="text-gray-600 text-sm">Monitor your wellness journey with detailed analytics and visual patterns.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-lg">🎯</span>
              </div>
              <h3 className="font-bold text-gray-800">Identify Trends</h3>
            </div>
            <p className="text-gray-600 text-sm">Discover patterns in your wellness data to make informed decisions.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 text-lg">💡</span>
              </div>
              <h3 className="font-bold text-gray-800">Get Insights</h3>
            </div>
            <p className="text-gray-600 text-sm">Receive personalized recommendations based on your wellness patterns.</p>
          </div>
        </div>
      </LoadingWrapper>
    </div>
  );
};

export default DailyInsights;
