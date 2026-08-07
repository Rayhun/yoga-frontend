export const CUSTOMER_V2_HOME_SECTIONS = {
  period: { flag: 'is_period_section', urlKey: 'period_section_url' },
  checkin: { flag: 'is_checkin_section', urlKey: 'checkin_section_url' },
  checkin_info: { flag: 'is_checkin_info', urlKey: 'checkin_info_url' },
  personalized: { flag: 'is_personalized_section', urlKey: 'personalized_section_url' },
  scored: { flag: 'is_scored_section', urlKey: 'scored_section_url' },
  coach: { flag: 'is_coach_section', urlKey: 'coach_section_url' },
  getting_started: { flag: 'is_getting_started_section', urlKey: 'getting_started_section_url' },
  auto_tracker: { flag: 'is_auto_tracker_section', urlKey: 'auto_tracker_section_url' },
  feature: { flag: 'is_feature_section', urlKey: 'feature_section_url' },
  trend: { flag: 'is_trend_section', urlKey: 'trend_section_url' },
  today_plan: { flag: 'is_today_plan_section', urlKey: 'today_section_url' },
  progress: { flag: 'is_progress_section', urlKey: 'progress_section_url' },
  program: { flag: 'is_program_section', urlKey: 'program_section_url' },
  explore: { flag: 'is_explore_section', urlKey: 'explore_section_url' },
  info: { flag: 'is_info_section', urlKey: null },
};

/** half = pairs into 2-col rows; full = always own row */
export const SECTION_LAYOUT_WIDTH = {
  period: 'full',
  checkin: 'half',
  checkin_info: 'half',
  personalized: 'half',
  scored: 'half',
  coach: 'full',
  getting_started: 'full',
  auto_tracker: 'full',
  feature: 'full',
  trend: 'half',
  today_plan: 'half',
  progress: 'half',
  program: 'half',
  explore: 'half',
  info: 'full',
};

const DEFAULT_SECTIONS_ORDER = Object.keys(CUSTOMER_V2_HOME_SECTIONS);

export function hasSectionInfo(data) {
  return Boolean(data?.is_info && data?.info?.data);
}

export function isHomeSectionFlagEnabled(home, key) {
  if (!home) return false;
  if (key === 'info') return Boolean(home.is_info_section);
  const config = CUSTOMER_V2_HOME_SECTIONS[key];
  if (!config) return false;
  return Boolean(home[config.flag]);
}

export function sectionHasContent(key, data, home) {
  switch (key) {
    case 'period':
      return Boolean(data?.title);
    case 'checkin':
      return normalizeMoodOptions(data?.tracker).length > 0;
    case 'checkin_info':
      return Boolean(data?.title);
    case 'personalized':
      return Boolean(data?.title);
    case 'scored':
      return data?.score != null;
    case 'coach':
      return Boolean(data?.title);
    case 'getting_started':
      return Boolean(data?.steps?.length);
    case 'auto_tracker':
      return Boolean(data?.metrics?.length);
    case 'feature':
      return Boolean(data?.items?.length);
    case 'trend':
      return Boolean(data?.title);
    case 'today_plan':
      return Boolean(data?.title);
    case 'progress':
      return Boolean(data?.title);
    case 'program':
      return Boolean(data?.title);
    case 'explore':
      return Boolean(data?.title);
    case 'info':
      return Boolean(home?.info_section_data?.text);
    default:
      return false;
  }
}

/**
 * Build render groups from backend sections_order + flags.
 * Removed sections collapse; lone half-width cards span the full row.
 */
export function buildHomeLayoutGroups(home, { isLoading = false, sectionData = {} } = {}) {
  const order = home?.sections_order?.length ? home.sections_order : DEFAULT_SECTIONS_ORDER;

  const visibleKeys = order.filter(key => {
    if (!isHomeSectionFlagEnabled(home, key)) return false;
    if (isLoading) return true;
    return sectionHasContent(key, sectionData[key], home);
  });

  const groups = [];
  let halfBuffer = [];

  const flushHalf = () => {
    if (!halfBuffer.length) return;
    groups.push({ type: 'grid', keys: [...halfBuffer] });
    halfBuffer = [];
  };

  for (const key of visibleKeys) {
    const width = SECTION_LAYOUT_WIDTH[key] || 'full';
    if (width === 'full') {
      flushHalf();
      groups.push({ type: 'full', keys: [key] });
    } else {
      halfBuffer.push(key);
      if (halfBuffer.length === 2) flushHalf();
    }
  }
  flushHalf();

  return groups;
}

export function getEnabledHomeSections(home) {
  if (!home) return [];

  const order = home.sections_order?.length ? home.sections_order : DEFAULT_SECTIONS_ORDER;

  return order
    .filter(key => {
      const config = CUSTOMER_V2_HOME_SECTIONS[key];
      if (!config) return false;
      if (key === 'info') return Boolean(home.is_info_section);
      return Boolean(home[config.flag] && home[config.urlKey]);
    })
    .map(key => ({
      key,
      url: key === 'info' ? null : home[CUSTOMER_V2_HOME_SECTIONS[key].urlKey],
    }));
}

export function normalizeMoodOptions(tracker) {
  if (!tracker) return [];

  const options = [];
  for (let index = 1; index <= 5; index += 1) {
    const title = tracker[`option_${index}_title`];
    if (title == null || title === '') continue;
    options.push({
      index,
      title: String(title),
      icon: tracker[`option_${index}_icon`] ?? '🙂',
      description: tracker[`option_${index}_description`] ?? '',
    });
  }
  return options;
}

export function chipPaletteClass(palette) {
  if (palette === 'blush') {
    return 'bg-rose-50 text-rose-800 border-rose-100';
  }
  if (palette === 'sage') {
    return 'bg-primary/10 text-primary border-primary/20';
  }
  return 'bg-primary/10 text-primary border-primary/20';
}
