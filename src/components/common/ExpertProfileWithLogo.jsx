'use client';

import ExpertAvatar, { ExpertEmojiAvatar } from '@/components/common/ExpertAvatar';
import { isExpertImageUrl } from '@/utils/expert-media';

const DEFAULT_LOGO_FALLBACK = '🌿';
const WHITE = '#FFFFFF';

/**
 * Expert profile photo with business logo badge (bottom-right),
 * matching the portal avatar + logo composition.
 */
export default function ExpertProfileWithLogo({
  src,
  logo,
  name = '',
  size = 64,
  logoSize,
  className = '',
  ringClassName = '',
  avatarBackgroundColor,
  logoBackgroundColor = WHITE,
  logoRingClassName = 'ring-2 ring-white',
  fallbackEmoji,
  alt,
}) {
  const badgeSize = logoSize || Math.max(22, Math.round(size * 0.4));
  const showEmojiAvatar = src && !isExpertImageUrl(src);
  const hasLogo = Boolean(logo);
  const logoIsImage = isExpertImageUrl(logo);
  // PNG/logo images always sit on white so transparent assets stay readable
  const badgeBg = logoIsImage ? WHITE : logoBackgroundColor;

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div
        className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full ${ringClassName}`}
        style={avatarBackgroundColor ? { backgroundColor: avatarBackgroundColor } : undefined}
      >
        {showEmojiAvatar ? (
          <ExpertEmojiAvatar
            emoji={src}
            className={size >= 80 ? 'text-3xl' : size >= 56 ? 'text-2xl' : 'text-xl'}
          />
        ) : (
          <ExpertAvatar
            src={src}
            name={name}
            size={size}
            tone="light"
            imageClassName="h-full w-full rounded-full object-cover"
            fallbackClassName="h-full w-full rounded-full"
            emoji={fallbackEmoji}
          />
        )}
      </div>

      {hasLogo ? (
        <span
          className={`absolute -bottom-0.5 -right-0.5 flex items-center justify-center overflow-hidden rounded-full shadow-sm ${logoRingClassName}`}
          style={{
            width: badgeSize,
            height: badgeSize,
            backgroundColor: badgeBg,
          }}
          aria-hidden="true"
        >
          {logoIsImage ? (
            <img
              src={logo}
              alt={alt ? `${alt} logo` : 'Business logo'}
              className="h-full w-full bg-white object-contain p-[2%]"
            />
          ) : (
            <span
              className={`leading-none ${
                badgeSize >= 28 ? 'text-sm' : badgeSize >= 22 ? 'text-xs' : 'text-[10px]'
              }`}
            >
              {logo || DEFAULT_LOGO_FALLBACK}
            </span>
          )}
        </span>
      ) : null}
    </div>
  );
}
