'use client';

import { getCommunityColor } from './communityColors';

const MetricsGridSection = ({ section }) => {
  const metrics = section?.metrics || [];
  if (!metrics.length) return null;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      {metrics.map(metric => (
        <div
          key={metric.id || metric.label}
          className="relative rounded-2xl border border-gray-100 p-5 shadow-sm md:p-6"
          style={{
            backgroundColor: getCommunityColor(metric.background_color, '#FFFFFF'),
          }}
        >
          {metric.badge?.text ? (
            <span
              className="absolute right-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{
                backgroundColor: getCommunityColor(
                  metric.badge.background_color,
                  '#FFF3CD'
                ),
                color: getCommunityColor(metric.badge.text_color, '#856404'),
              }}
            >
              {metric.badge.text}
            </span>
          ) : null}

          <div
            className={`mb-2 flex items-center gap-1 text-3xl font-bold md:text-4xl ${
              metric.is_blurred ? 'select-none blur-sm' : ''
            }`}
            style={{ color: getCommunityColor(metric.value_color, '#111827') }}
          >
            {metric.trend_indicator ? (
              <span className="text-lg md:text-xl">{metric.trend_indicator}</span>
            ) : null}
            <span>{metric.value}</span>
          </div>

          <p
            className="text-sm md:text-base"
            style={{ color: getCommunityColor(metric.label_color, '#6B7280') }}
          >
            {metric.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MetricsGridSection;
