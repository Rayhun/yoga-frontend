'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FiArrowLeft } from 'react-icons/fi';
import PageLoader from '@/components/common/loader/PageLoader';
import { getExpertCircleWellnessInsights } from '@/services/private/expert/dashboard';
import queryKeys from '@/utils/query-keys';
import WellnessInsightsChart from './WellnessInsightsChart';

const BAR_OPACITIES = [1, 0.85, 0.7, 0.55, 0.4];

const SummaryStatCard = ({ stat }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div
      className="mb-4 flex h-11 w-11 items-center justify-center rounded-full text-lg"
      style={{ backgroundColor: stat.icon_bg || '#F3F4F6' }}
    >
      <span aria-hidden>{stat.icon}</span>
    </div>
    <p className="font-serif text-3xl font-semibold tracking-tight text-gray-900">
      {stat.value_display}
    </p>
    <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
  </div>
);

const BreakdownBar = ({ item, barColor, shadeIndex }) => {
  const opacity = BAR_OPACITIES[shadeIndex] ?? BAR_OPACITIES[BAR_OPACITIES.length - 1];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-gray-700">{item.label}</span>
        <span className="shrink-0 font-semibold text-gray-900">{item.percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(item.percent, 4)}%`,
            backgroundColor: barColor,
            opacity,
          }}
        />
      </div>
    </div>
  );
};

const BreakdownSection = ({ section }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-2">
      <span className="text-lg" aria-hidden>
        {section.icon}
      </span>
      <h3 className="font-serif text-lg font-semibold text-gray-900">{section.title}</h3>
    </div>

    {section.items?.length ? (
      <div className="space-y-4">
        {section.items.map((item, index) => (
          <BreakdownBar
            key={`${section.id}-${item.value}`}
            item={item}
            barColor={section.bar_color || '#2E7D32'}
            shadeIndex={index}
          />
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-400">No data yet.</p>
    )}
  </div>
);

const ExpertWellnessInsights = () => {
  const [period, setPeriod] = useState('week');
  const [chartMetric, setChartMetric] = useState('wellness_score');

  const { data, isLoading, isError } = useQuery({
    queryFn: () => getExpertCircleWellnessInsights(period),
    queryKey: [queryKeys.expertCircleWellnessInsights, period],
    refetchOnMount: 'always',
  });

  const pageData = data?.data?.data;

  const activeChartMetric = useMemo(() => {
    const metrics = pageData?.chart_metrics || [];
    return metrics.find(metric => metric.id === chartMetric) || metrics[0];
  }, [pageData, chartMetric]);

  const chartPoints = pageData?.charts?.[activeChartMetric?.id] || [];

  if (isLoading) return <PageLoader />;

  if (isError || !pageData) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">Unable to load wellness insights</h2>
        <p className="text-sm text-gray-500">Please try again in a moment.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <Link
        href="/portal/teacher/dashboard"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div>
        <h1 className="font-serif text-3xl font-semibold text-gray-900">{pageData.title}</h1>
        {pageData.subtitle ? (
          <p className="mt-2 max-w-3xl text-sm text-gray-500 sm:text-[15px]">{pageData.subtitle}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {(pageData.period_tabs || []).map(tab => {
          const active = tab.id === period;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPeriod(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? 'bg-[#1E4D35] text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(pageData.summary_stats || []).map(stat => (
          <SummaryStatCard key={stat.id} stat={stat} />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap gap-2">
          {(pageData.chart_metrics || []).map(metric => {
            const active = metric.id === activeChartMetric?.id;
            return (
              <button
                key={metric.id}
                type="button"
                onClick={() => setChartMetric(metric.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-[#1E4D35] text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span aria-hidden>{metric.icon}</span>
                {metric.label}
              </button>
            );
          })}
        </div>

        <div className="mb-2">
          <h2 className="font-serif text-xl font-semibold text-gray-900">
            {activeChartMetric?.title}
          </h2>
          {activeChartMetric?.subtitle ? (
            <p className="mt-1 text-sm text-gray-500">{activeChartMetric.subtitle}</p>
          ) : null}
        </div>

        {pageData.has_data ? (
          <WellnessInsightsChart
            points={chartPoints}
            unit={activeChartMetric?.unit || ''}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
            <p className="text-sm text-gray-500">{pageData.empty_text}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(pageData.breakdown_sections || []).map(section => (
          <BreakdownSection key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
};

export default ExpertWellnessInsights;
