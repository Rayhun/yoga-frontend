'use client';

import { getCommunityColor } from './communityColors';

const CommunityInfoBanner = ({ banner }) => {
  if (!banner?.text) return null;

  return (
    <div
      className="rounded-xl border px-4 py-3.5 text-left text-sm leading-relaxed md:px-5 md:py-4 md:text-base"
      style={{
        backgroundColor: getCommunityColor(banner.background_color, '#FFF8E7'),
        borderColor: getCommunityColor(banner.border_color, '#F5D78E'),
        color: getCommunityColor(banner.text_color, '#6B5B3E'),
      }}
    >
      {banner.icon ? <span className="mr-1.5">{banner.icon}</span> : null}
      {banner.text}
    </div>
  );
};

export default CommunityInfoBanner;
