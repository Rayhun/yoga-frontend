'use client';

import { FaStar } from 'react-icons/fa';
import ExpertProfileWithLogo from '@/components/common/ExpertProfileWithLogo';
import {
  getCommunityColor,
  getHeaderBackgroundStyle,
  isCommunityMediaUrl,
} from '@/components/inbox/community/communityColors';
import JoinCircleMetrics from '@/components/join/JoinCircleMetrics';

const JoinCircleBrandingPanel = ({ header, metricsRow }) => {
  if (!header) return null;

  const avatarSrc = header.avatar_url || header.avatar_icon;
  const metrics = metricsRow?.items || [];
  const badgeIcon = header.badge?.icon;
  const showStar =
    !badgeIcon || badgeIcon === 'star' || badgeIcon === '⭐' || badgeIcon === '★';
  const logo =
    header.logo_icon &&
    (isCommunityMediaUrl(header.logo_icon) || typeof header.logo_icon === 'string')
      ? header.logo_icon
      : null;

  return (
    <div
      className="relative flex h-full min-h-[360px] flex-col overflow-hidden sm:min-h-[400px] lg:min-h-0"
      style={
        header.background_color
          ? { backgroundColor: header.background_color }
          : getHeaderBackgroundStyle(header)
      }
    >
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-10 text-center sm:py-12 lg:px-12">
        <div className="mx-auto w-full max-w-md space-y-4">
          <div className="flex justify-center">
            <div className="sm:hidden">
              <ExpertProfileWithLogo
                src={avatarSrc || ''}
                logo={logo}
                name={header.title || 'Coach'}
                size={88}
                logoSize={34}
                avatarBackgroundColor={getCommunityColor(
                  header.avatar_background_color,
                  '#FFFFFF'
                )}
                logoBackgroundColor="#FFFFFF"
                logoRingClassName="ring-2 ring-white shadow-sm"
                ringClassName="shadow-sm"
                alt={header.title || 'Coach'}
              />
            </div>
            <div className="hidden sm:block">
              <ExpertProfileWithLogo
                src={avatarSrc || ''}
                logo={logo}
                name={header.title || 'Coach'}
                size={96}
                logoSize={38}
                avatarBackgroundColor={getCommunityColor(
                  header.avatar_background_color,
                  '#FFFFFF'
                )}
                logoBackgroundColor="#FFFFFF"
                logoRingClassName="ring-2 ring-white shadow-sm"
                ringClassName="shadow-sm"
                alt={header.title || 'Coach'}
              />
            </div>
          </div>

          {header.eyebrow ? (
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: getCommunityColor(header.eyebrow_color, '#E8C547') }}
            >
              {header.eyebrow}
            </p>
          ) : null}

          {header.title ? (
            <h1
              className="font-serif text-[1.85rem] font-bold leading-tight text-white sm:text-[2.1rem] lg:text-[2.35rem]"
              style={{ color: getCommunityColor(header.title_color, '#FFFFFF') }}
            >
              {header.title}
            </h1>
          ) : null}

          {header.subtitle ? (
            <p
              className="mx-auto max-w-xs text-sm leading-relaxed text-white sm:text-[15px]"
              style={{ color: getCommunityColor(header.subtitle_color, '#FFFFFF') }}
            >
              {header.subtitle}
            </p>
          ) : null}

          {header.badge?.text ? (
            <div className="flex justify-center pt-1">
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium"
                style={{
                  backgroundColor: getCommunityColor(
                    header.badge.background_color,
                    'rgba(0, 0, 0, 0.28)'
                  ),
                  color: getCommunityColor(header.badge.text_color, '#FFFFFF'),
                }}
              >
                {showStar ? (
                  <FaStar className="h-3 w-3 text-[#E8C547]" />
                ) : (
                  <span>{badgeIcon}</span>
                )}
                <span>{header.badge.text}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {metrics.length > 0 ? (
        <div className="relative z-10 shrink-0 px-5 pb-7 sm:px-8 sm:pb-9 lg:px-10 lg:pb-10">
          <div className="mx-auto w-full max-w-md">
            <JoinCircleMetrics items={metrics} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default JoinCircleBrandingPanel;
