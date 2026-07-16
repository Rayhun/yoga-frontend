'use client';

import {
  getCommunityColor,
  getHeaderBackgroundStyle,
  isCommunityMediaUrl,
} from './communityColors';

const CommunityIconBadge = ({
  value,
  alt,
  shape = 'rounded',
  className = '',
  backgroundColor,
  textClassName = 'text-base md:text-lg',
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

const CommunityDetailHeader = ({ header }) => {
  if (!header) return null;

  const logoIcon = header.logo_icon;
  const avatarSrc = header.avatar_url || header.avatar_icon;
  const hasIconGroup = logoIcon || avatarSrc;

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-5 py-5 md:px-8 md:py-6"
      style={getHeaderBackgroundStyle(header)}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-5">
          {hasIconGroup ? (
            <div className="relative flex shrink-0 items-center">
              {logoIcon ? (
                <CommunityIconBadge
                  value={logoIcon}
                  alt={`${header.title || 'Circle'} logo`}
                  shape="rounded"
                  className="relative z-0 h-11 w-11 md:h-12 md:w-12"
                  backgroundColor={getCommunityColor(
                    header.logo_background_color,
                    'rgba(255, 255, 255, 0.14)'
                  )}
                />
              ) : null}

              {avatarSrc ? (
                <CommunityIconBadge
                  value={avatarSrc}
                  alt={header.title || 'Expert'}
                  shape="circle"
                  className={`relative z-10 h-12 w-12 md:h-14 md:w-14 ${
                    logoIcon ? '-ml-2.5 md:-ml-3' : ''
                  }`}
                  backgroundColor={getCommunityColor(
                    header.avatar_background_color,
                    '#F5F3ED'
                  )}
                  textClassName="text-xl md:text-2xl"
                />
              ) : null}
            </div>
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
