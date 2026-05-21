'use client';

import React, { useState } from 'react';
import { INSIGHT_STATISTICS_DEFAULTS } from './insightStatisticsDefaults';

const StatisticsInfoButton = ({ helpContent, hasData, insightType = 'habit', className = '' }) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const content = helpContent || INSIGHT_STATISTICS_DEFAULTS[insightType];
  const showMetrics = hasData && content.metrics?.length > 0;

  return (
    <div className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        aria-label="Statistics info"
        onClick={() => setInfoOpen((prev) => !prev)}
        className="w-7 h-7 rounded-full border border-gray-200 bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>
      </button>

      {infoOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white border border-emerald-100 rounded-xl shadow-xl p-4 z-50">
          <div className="flex items-start justify-between gap-2 mb-2">
            {showMetrics ? (
              <h4 className="text-sm font-bold text-gray-900 pr-2">{content.title}</h4>
            ) : (
              <div className="flex items-start gap-2 pr-2">
                <div className="w-7 h-7 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                  i
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-snug text-left">
                  {content.empty_message}
                </p>
              </div>
            )}
            <button
              type="button"
              aria-label="Close statistics info"
              onClick={() => setInfoOpen(false)}
              className="text-gray-500 hover:text-gray-700 shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {showMetrics && (
            <ul className="space-y-3 text-sm text-gray-700 text-left">
              {content.metrics.map((metric) => (
                <li key={metric.label} className="leading-snug">
                  <span className="font-semibold text-gray-900">{metric.label}:</span>{' '}
                  {metric.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default StatisticsInfoButton;
