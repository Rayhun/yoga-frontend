'use client';

import { useEffect, useState } from 'react';
import {
  EXPERT_PLACEHOLDER_IMAGE,
  getExpertInitials,
  isExpertImageUrl,
} from '@/utils/expert-media';

export default function ExpertCoverImage({
  src,
  name = '',
  className = 'h-full w-full object-cover',
  wrapperClassName = 'relative aspect-[16/9] overflow-hidden bg-stone-100',
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = isExpertImageUrl(src) && !failed ? src.trim() : null;
  const initials = getExpertInitials(name);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!imageSrc) {
    return (
      <div className={`flex items-center justify-center bg-primary/5 ${wrapperClassName}`}>
        {initials ? (
          <span className="text-5xl font-bold tracking-wide text-primary/50">{initials}</span>
        ) : (
          <img
            src={EXPERT_PLACEHOLDER_IMAGE}
            alt={name ? `${name} profile` : 'Coach profile'}
            className={className}
          />
        )}
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <img
        src={imageSrc}
        alt={name ? `${name} profile` : 'Coach profile'}
        className={className}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
