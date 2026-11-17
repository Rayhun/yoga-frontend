// Pure helpers behind the Professional Tracks catalog page (no React, no I/O) so they can be tested
// without a browser. The backend's track_type values: clinical | coaching_practice | foundational | null.

export const TRACK_TYPE_PARAM = 'track_type';

export const TRACK_FILTERS = [
  { value: '', label: 'All Tracks' },
  { value: 'clinical', label: 'Clinical Tracks' },
  { value: 'coaching_practice', label: 'Coaching & Practice Tracks' },
  { value: 'foundational', label: 'Foundational Tracks' },
];

export const TRACK_BADGE_LABELS = {
  clinical: 'Clinical Track',
  coaching_practice: 'Coaching & Practice Track',
  foundational: 'Foundational Track',
};
export const DEFAULT_TRACK_BADGE = 'Professional Track';

// A value from the URL that is not one of the pills is treated as "All Tracks" (the API would 400 on it).
export const parseTrackType = raw => (TRACK_FILTERS.some(filter => filter.value && filter.value === raw) ? raw : '');

export const trackBadgeLabel = trackType => TRACK_BADGE_LABELS[trackType] || DEFAULT_TRACK_BADGE;

// Price and Level pills ("Any" = no param). Their values are what the API's ?price= / ?level= accept;
// Certification/program_levels.py is the backend's list of levels.
export const PRICE_PARAM = 'price';
export const LEVEL_PARAM = 'level';

export const PRICE_FILTERS = [
  { value: '', label: 'Any' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

export const LEVEL_FILTERS = [
  { value: '', label: 'Any' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const parseOption = (options, raw) => (options.some(option => option.value && option.value === raw) ? raw : '');

// A value from the URL that is not one of the pills is treated as "Any" (the API would 400 on it).
export const parsePrice = raw => parseOption(PRICE_FILTERS, raw);
export const parseLevel = raw => parseOption(LEVEL_FILTERS, raw);

// The URL keys the Clear filters action removes (the search box is cleared separately).
export const CLEARABLE_FILTER_PARAMS = [TRACK_TYPE_PARAM, PRICE_PARAM, LEVEL_PARAM];
export const clearedFilterParams = () => Object.fromEntries(CLEARABLE_FILTER_PARAMS.map(key => [key, '']));

// Query params for GET /certification/programs/catalog/. Empty values are left out, so "All Tracks"
// sends no track_type at all and "Any" sends no price / level.
export const buildCatalogParams = ({ trackType = '', price = '', level = '', recommended = false } = {}) => {
  const params = {}; // no tags / categories: wellness-plan tags are not a catalog filter
  if (trackType) params[TRACK_TYPE_PARAM] = trackType;
  if (price) params[PRICE_PARAM] = price;
  if (level) params[LEVEL_PARAM] = level;
  if (recommended) params.recommended = 'true';
  return params;
};

// Card text for a program's level: the three known levels capitalised whatever their stored case; a legacy
// value shown as stored (trimmed); nothing when blank.
export const levelLabel = program => {
  const raw = typeof program?.level === 'string' ? program.level.trim() : '';
  if (!raw) return '';
  const known = LEVEL_FILTERS.find(option => option.value && option.value === raw.toLowerCase());
  return known ? known.label : raw;
};

// "1 Module" / "3 Modules"; a missing count reads as 0.
export const countLabel = (count, noun) => {
  const total = count || 0;
  return `${total} ${noun}${total === 1 ? '' : 's'}`;
};

export const metaLabel = program => `${countLabel(program?.module_count, 'Module')} • ${countLabel(program?.lesson_count, 'Lesson')}`;

// "USD 500 one-time" (whole amounts lose the ".00"), or "Free".
export const priceLabel = program => {
  if (program?.payment_type === 'free') return 'Free';
  const amount = Number(program?.price);
  const shown = Number.isFinite(amount) ? (Number.isInteger(amount) ? String(amount) : amount.toFixed(2)) : program?.price;
  return `${program?.currency || 'USD'} ${shown} one-time`;
};

export const isInProgress = program => Boolean(program?.is_enrolled || program?.enroll_status);

export const startOrContinueLabel = program => (isInProgress(program) ? 'Continue Track' : 'Start Track');

// A program at most once per section, first occurrence wins.
export const dedupeById = programs => {
  const seen = new Set();
  return (programs || []).filter(program => {
    if (seen.has(program.id)) return false;
    seen.add(program.id);
    return true;
  });
};

export const matchesSearch = (program, searchText) =>
  !searchText || (program.title || '').toLowerCase().includes(searchText.toLowerCase());

// "My Active Tracks": the learner's in-progress enrollments. Each enrolled card carries its own
// `track_type` (same rule as the catalog), so a track pill filters them directly. That keeps a program
// that is no longer published, and so absent from the catalog, correctly filtered.
export const selectActiveTracks = (enrolled, { searchText = '', trackType = '' } = {}) =>
  dedupeById(enrolled).filter(
    program =>
      program.enroll_status === 'InProgress' &&
      matchesSearch(program, searchText) &&
      (!trackType || program.track_type === trackType)
  );

const NAMED_ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };

// A description as plain text: tags removed (script/style bodies with them), common entities decoded,
// whitespace collapsed. The result is only ever rendered as a React text child (escaped), never as HTML,
// so even a leftover "<" is shown literally and cannot run anything.
export const plainText = value => {
  if (typeof value !== 'string') return '';
  let text = value.replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, ' ');
  let previous;
  do {
    previous = text;
    text = text.replace(/<[^>]*>/g, ' '); // repeated, so "<<b>script>" cannot reassemble a tag
  } while (text !== previous);
  return text
    .replace(/&(amp|lt|gt|quot|nbsp|#39);/g, entity => NAMED_ENTITIES[entity])
    .replace(/\s+/g, ' ')
    .trim();
};

export const selectCatalogPrograms = (programs, searchText = '') =>
  dedupeById(programs).filter(program => matchesSearch(program, searchText));
