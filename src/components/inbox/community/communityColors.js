export const DEFAULT_COMMUNITY_COLORS = {
  pageBackground: '#FAF9F7',
  sectionBackground: '#FAF9F7',
  stepNumber: '#1E4D35',
  ctaButton: '#1E4D35',
  iconBackground: '#E8F0E8',
};

export const getCommunityColor = (color, fallback) => color || fallback;

/** True when logo_icon / avatar_icon is an image URL (not an emoji fallback). */
export const isCommunityMediaUrl = value => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (trimmed.startsWith('//')) return true;
  if (trimmed.startsWith('data:image/')) return true;
  if (trimmed.startsWith('/')) return true;
  return /\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(trimmed);
};

export const DEFAULT_HEADER_GRADIENT = {
  start: '#215138',
  end: '#386E51',
};

export const getHeaderBackgroundStyle = header => {
  const gradient = header?.background_gradient;
  const start = gradient?.start || header?.background_gradient_start || DEFAULT_HEADER_GRADIENT.start;
  const end = gradient?.end || header?.background_gradient_end || DEFAULT_HEADER_GRADIENT.end;

  if (gradient || header?.background_gradient_start || header?.background_gradient_end) {
    return { background: `linear-gradient(to right, ${start} 0%, ${end} 100%)` };
  }

  if (header?.background_color) {
    return { backgroundColor: header.background_color };
  }

  return {
    background: `linear-gradient(to right, ${DEFAULT_HEADER_GRADIENT.start} 0%, ${DEFAULT_HEADER_GRADIENT.end} 100%)`,
  };
};
