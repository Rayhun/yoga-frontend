'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_EXPERT_EMOJI,
  EXPERT_PLACEHOLDER_IMAGE,
  getExpertInitials,
  isExpertImageUrl,
} from '@/utils/expert-media';

export default function ExpertAvatar({
  src,
  name = '',
  size = 48,
  className = '',
  imageClassName = 'h-full w-full object-cover',
  fallbackClassName = '',
  emoji = DEFAULT_EXPERT_EMOJI,
  useInitials = true,
  placeholderImage = EXPERT_PLACEHOLDER_IMAGE,
  tone = 'light',
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = isExpertImageUrl(src) && !failed ? src.trim() : null;
  const initials = getExpertInitials(name);
  const initialsSizeClass = size >= 56 ? 'text-base' : 'text-sm';
  const toneClasses =
    tone === 'dark'
      ? 'bg-white/25 text-white ring-1 ring-white/35'
      : 'bg-primary/15 text-primary';

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!imageSrc) {
    if (useInitials && initials) {
      return (
        <div
          className={`flex items-center justify-center font-bold ${toneClasses} ${fallbackClassName || className}`}
          style={{ width: size, height: size }}
          aria-hidden="true"
        >
          <span className={`${initialsSizeClass} leading-none tracking-wide`}>{initials}</span>
        </div>
      );
    }

    return (
      <img
        src={placeholderImage}
        alt={name ? `${name} profile` : 'Coach profile'}
        width={size}
        height={size}
        className={imageClassName || className}
      />
    );
  }

  return (
    <img
      src={imageSrc}
      alt={name ? `${name} profile` : 'Coach profile'}
      width={size}
      height={size}
      className={imageClassName || className}
      onError={() => setFailed(true)}
    />
  );
}

export function ExpertEmojiAvatar({ emoji = DEFAULT_EXPERT_EMOJI, className = '' }) {
  return <span className={`leading-none ${className}`}>{emoji}</span>;
}
