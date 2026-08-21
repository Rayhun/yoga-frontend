'use client';

import ExpertProfileWithLogo from '@/components/common/ExpertProfileWithLogo';
import {
  getCommunityColor,
  getHeaderBackgroundStyle,
  isCommunityMediaUrl,
} from './communityColors';

const CommunityDetailHeader = ({ header }) => {
  if (!header) return null;

  const logoIcon = header.logo_icon;
  const avatarSrc = header.avatar_url || header.avatar_icon;
  const hasAvatar = Boolean(avatarSrc);
  const logo =
    logoIcon && (isCommunityMediaUrl(logoIcon) || typeof logoIcon === 'string')
      ? logoIcon
      : null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-5 py-5 md:px-8 md:py-6"
      style={getHeaderBackgroundStyle(header)}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-5">
          {hasAvatar ? (
            <ExpertProfileWithLogo
              src={avatarSrc}
              logo={logo}
              name={header.title || ''}
              size={56}
              logoSize={26}
              avatarBackgroundColor={getCommunityColor(
                header.avatar_background_color,
                '#F5F3ED'
              )}
              logoBackgroundColor={getCommunityColor(
                header.logo_background_color,
                'rgba(255, 255, 255, 0.95)'
              )}
              logoRingClassName="ring-2 ring-white/90"
              alt={header.title || 'Expert'}
            />
          ) : null}

          <div className="min-w-0 text-left">
            {header.title ? (
              <h2
                className="truncate font-serif text-lg font-bold leading-tight md:text-2xl lg:text-[1.75rem]"
                style={{ color: getCommunityColor(header.title_color, '#FFFFFF') }}
              >
                {header.title}
              </h2>
            ) : null}
            {header.subtitle ? (
              <p
                className="mt-0.5 truncate text-xs font-normal leading-snug md:text-sm"
                style={{ color: getCommunityColor(header.subtitle_color, '#D1E7DD') }}
              >
                {header.subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {header.badge?.text ? (
          <div
            className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium md:px-3 md:py-1.5 md:text-xs"
            style={{
              backgroundColor: getCommunityColor(
                header.badge.background_color,
                'rgba(17, 40, 28, 0.45)'
              ),
              color: getCommunityColor(header.badge.text_color, '#FFFFFF'),
            }}
          >
            {header.badge.icon ? <span className="text-[10px] md:text-xs">{header.badge.icon}</span> : null}
            <span className="whitespace-nowrap">{header.badge.text}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CommunityDetailHeader;
