const TAB_ROUTE_MAP = {
  'quick tools': '',
  trend_track: 'track',
  track: 'track',
  faq: 'faq',
  saved: 'saved',
};

const TAB_LABEL_MAP = {
  trend_track: 'Track',
};

export const normalizeReliefTabTitle = title =>
  (title || '').trim().toLowerCase().replace(/\s+/g, ' ');

export const getReliefTabLabel = title => {
  const key = normalizeReliefTabTitle(title);
  return TAB_LABEL_MAP[key] || title;
};

export const getReliefTabSlug = title => {
  const key = normalizeReliefTabTitle(title);
  return TAB_ROUTE_MAP[key] ?? key.replace(/\s+/g, '-');
};

export const getReliefTabHref = slug => {
  if (!slug) return '/portal/customer/relief';
  return `/portal/customer/relief/${slug}`;
};

export const getVisibleReliefTabs = (tabs = []) =>
  (tabs || []).filter(tab => tab?.is_visible !== false);

export const getReliefPathSlug = pathname => {
  const base = '/portal/customer/relief';
  if (!pathname || pathname === base) return '';
  if (pathname.startsWith(`${base}/quick/`)) return '';
  if (pathname.startsWith(`${base}/`)) {
    const segment = pathname.slice(base.length + 1).split('/')[0];
    if (['track', 'faq', 'saved'].includes(segment)) return segment;
  }
  return '';
};

export const getActiveReliefTabSlug = (tabs = [], pathname) => {
  const visibleTabs = getVisibleReliefTabs(tabs);
  const pathSlug = getReliefPathSlug(pathname);
  const visibleSlugs = visibleTabs.map(tab => getReliefTabSlug(tab.title));

  if (visibleSlugs.includes(pathSlug)) return pathSlug;

  const flagged = visibleTabs.find(tab => tab.is_active);
  if (flagged) return getReliefTabSlug(flagged.title);

  return visibleSlugs[0] ?? '';
};

export const extractQuickCategoryFromUrl = url => {
  if (!url) return null;
  const match = String(url).match(/\/quick\/([^/?#]+)/i);
  return match?.[1] || null;
};

export const getQuickDetailHref = category => `/portal/customer/relief/quick/${category}`;

const SAVED_ITEM_CATEGORY_MAP = {
  saved_headache_relief: 'headache',
  saved_calm_stress: 'calm',
  saved_sleep_reset: 'sleep',
  saved_hydration_reset: 'hydration',
};

export const getSavedItemCategory = item => {
  if (item?.id && SAVED_ITEM_CATEGORY_MAP[item.id]) {
    return SAVED_ITEM_CATEGORY_MAP[item.id];
  }
  return extractQuickCategoryFromUrl(item?.cta?.url);
};

const ACTION_CARD_ICON_BACKGROUNDS = [
  'bg-emerald-50',
  'bg-sky-50',
  'bg-violet-50',
  'bg-amber-50',
];

export const getActionCardIconBackground = index =>
  ACTION_CARD_ICON_BACKGROUNDS[index % ACTION_CARD_ICON_BACKGROUNDS.length];

export const CTA_STYLE_CLASSES = {
  green_solid:
    'inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 hover:shadow-md disabled:hover:shadow-sm',
  orange_solid:
    'inline-flex shrink-0 items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md',
  outline_green:
    'inline-flex items-center justify-center rounded-full border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5',
  teal_solid:
    'inline-flex items-center justify-center rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800',
  blue_solid:
    'inline-flex items-center justify-center rounded-full bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800',
  purple_solid:
    'inline-flex items-center justify-center rounded-full bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800',
  link_gray:
    'inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-700',
};

export const getCtaClassName = variant => CTA_STYLE_CLASSES[variant] || CTA_STYLE_CLASSES.green_solid;
