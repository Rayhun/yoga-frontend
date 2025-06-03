'use client';

import React from 'react';
import dayjs from 'dayjs';
import { MdOutlineDateRange } from 'react-icons/md';
import WellnessStats from './Stats';
import MonthlyPatternsChart from './chart';
import KeyInsights from './KeyInsights';
import { getDailyInsights } from '@/services/private/customer/goal';
import queryKeys from '@/utils/query-keys';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import { useQuery } from '@tanstack/react-query';

const Section = ({ children }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div>{children}</div>
  </div>
);

const DailyInsights = () => {
  const { isFetching, data: insights } = useQuery({
    queryFn: () => getDailyInsights(),
    queryKey: [queryKeys.dailyInsight],
  });

  const insightsData = insights?.data?.data

  return (
    <LoadingWrapper isLoading={isFetching}>
      <div className="flex flex-col gap-7">
        <Section>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Wellness Insights</h2>
            <div className="py-2 px-4 text-gray-400 text-center flex gap-2 items-center">
              <MdOutlineDateRange size={18} /> {dayjs().format('ddd, MMM DD, YYYY')}
            </div>
          </div>
        </Section>
        <WellnessStats
          wellnessScore={insightsData?.wellness_score}
          average={insightsData?.average}
          latestTrend={insightsData?.latest_trend}
        />
        <Section>
          <MonthlyPatternsChart data={insightsData?.daily_patterns} />
        </Section>
        <Section>
          <KeyInsights insights={insightsData?.insight_data} />
        </Section>
      </div>
    </LoadingWrapper>
  );
};

export default DailyInsights;
