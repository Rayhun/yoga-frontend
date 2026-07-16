'use client';

import {
  getCommunityColor,
  getHeaderBackgroundStyle,
  isCommunityMediaUrl,
} from '@/components/inbox/community/communityColors';
import JoinCircleMetrics from '@/components/join/JoinCircleMetrics';

const CommunityIconBadge = ({
  value,
  alt,
  shape = 'rounded',
  className = '',
  backgroundColor,
  textClassName = 'text-lg',
}) => {
  const isImage = isCommunityMediaUrl(value);
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${shapeClass} ${className}`}
      style={{ backgroundColor }}
    >
      {isImage ? (
        <img src={value} alt={alt || ''} className="h-full w-full object-cover" />
      ) : (
        <span className={textClassName}>{value}</span>
      )}
    </div>
  );
};

const JoinCircleBrandingPanel = ({ header, metricsRow }) => {
  if (!header) return null;

  const logoIcon = header.logo_icon;
  const avatarSrc = header.avatar_url || header.avatar_icon;
  const hasIconGroup = logoIcon || avatarSrc;
  const metrics = metricsRow?.items || [];

  return (
    <div
      className="relative flex h-full min-h-[320px] flex-col overflow-hidden sm:min-h-[360px] lg:min-h-0"
      style={getHeaderBackgroundStyle(header)}
    >
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-8 text-center sm:py-10 lg:px-12 lg:py-12">
        <div className="mx-auto w-full max-w-sm space-y-4">
          {hasIconGroup ? (
            <div className="hidden items-center justify-center lg:flex">
              {logoIcon ? (
                <CommunityIconBadge
                  value={logoIcon}
                  alt={`${header.title || 'Circle'} logo`}
                  shape="rounded"
                  className="relative z-0 h-12 w-12"
                  backgroundColor={getCommunityColor(
                    header.logo_background_color,
                    'rgba(255, 255, 255, 0.2)'
                  )}
                />
              ) : null}

              {avatarSrc ? (
                <CommunityIconBadge
                  value={avatarSrc}
                  alt={header.title || 'Coach'}
                  shape="circle"
                  className={`relative z-10 h-12 w-12 ring-2 ring-white/30 ${
                    logoIcon ? '-ml-2.5' : ''
                  }`}
                  backgroundColor={getCommunityColor(
                    header.avatar_background_color,
                    '#F5F3ED'
                  )}
                  textClassName="text-xl"
                />
              ) : null}
            </div>
          ) : null}

          {header.eyebrow ? (
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: getCommunityColor(header.eyebrow_color, 'rgba(255,255,255,0.8)') }}
            >
              {header.eyebrow}
            </p>
          ) : null}

          {header.title ? (
            <h1
              className="font-serif text-[1.65rem] font-bold leading-tight text-white sm:text-[1.75rem] lg:text-[2rem]"
              style={{ color: getCommunityColor(header.title_color, '#FFFFFF') }}
            >
              {header.title}
            </h1>
          ) : null}

          {header.subtitle ? (
            <p
              className="mx-auto max-w-xs text-sm leading-relaxed"
              style={{ color: getCommunityColor(header.subtitle_color, '#C8E6D4') }}
            >
              {header.subtitle}
            </p>
          ) : null}

          {header.badge?.text ? (
            <div className="flex justify-center pt-1">
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium"
                style={{
                  backgroundColor: getCommunityColor(
                    header.badge.background_color,
                    'rgba(0, 0, 0, 0.25)'
                  ),
                  color: getCommunityColor(header.badge.text_color, '#FFFFFF'),
                }}
              >
                {header.badge.icon ? <span>{header.badge.icon}</span> : null}
                <span>{header.badge.text}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {metrics.length > 0 ? (
        <div className="relative z-10 shrink-0 px-6 pb-6 sm:pb-8 lg:px-12 lg:pb-10">
          <div className="mx-auto w-full max-w-sm">
            <JoinCircleMetrics items={metrics} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default JoinCircleBrandingPanel;
