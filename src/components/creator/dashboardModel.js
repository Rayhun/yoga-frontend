// Pure display rules for the creator (QTE / Institution) dashboard: no React, no requests, so they can be
// unit-tested directly. The numbers come from GET /certification/creator/dashboard/summary/ and .../activity/.
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime); // ships with dayjs, which the portal already uses

export const CREATOR_TYPE = { QTE: 'qte', INSTITUTION: 'institution' };

// Matches the backend's TREND_WINDOW_DAYS (Certification/dashboard_metrics.py); the API does not send it.
const TREND_WINDOW_DAYS = 30;
const FALLBACK_NAME = 'A learner';

const normalizeType = creatorType => (creatorType === CREATOR_TYPE.INSTITUTION ? CREATOR_TYPE.INSTITUTION : CREATOR_TYPE.QTE);

/** Where each creator kind's pages live. Every path here has a page in src/app/portal (a test checks that). */
export const creatorRoutes = creatorType => {
  const type = normalizeType(creatorType);
  const base = type === CREATOR_TYPE.INSTITUTION ? '/portal/institution' : '/portal/teacher';
  return {
    programs: type === CREATOR_TYPE.INSTITUTION ? '/portal/institution/programs' : '/portal/teacher/certification/programs',
    grading: `${base}/certification/grading`,
    newProgram: `${base}/certification/programs/builder/new`,
    builder: id => `${base}/certification/programs/builder/${id}`,
    preview: id => `${base}/certification/programs/${id}/preview`,
  };
};

// The route hints the API may send. A hint is only turned into a button when it is in this list, i.e. when
// the page actually exists in the app.
export const EXISTING_ROUTES = [
  '/portal/teacher/certification/grading',
  '/portal/teacher/certification/programs',
  '/portal/institution/certification/grading',
  '/portal/institution/programs',
];
export const resolveRoute = route => (EXISTING_ROUTES.includes(route) ? route : null);

/** Only an approved creator has numbers; every other application status shows the status card and nothing else. */
export const isCreatorDashboardEnabled = applicationStatus => applicationStatus === 'approved';

export const dashboardTitle = creatorType =>
  normalizeType(creatorType) === CREATOR_TYPE.INSTITUTION ? 'Institution Dashboard' : 'QTE Dashboard';

const plural = (count, word) => (count === 1 ? word : `${word}s`);
const isNumber = value => typeof value === 'number' && Number.isFinite(value);

// --- KPI row ---------------------------------------------------------------------------------------------

/**
 * The enrolled-learners trend as a muted sub-line: "▼ 100% new enrollments vs previous 30 days". The big
 * number stays the total enrolled, so the line says what the percentage is about (new enrollments, not
 * learners lost). Hidden (null) when there is no previous period.
 */
export const trendSubline = pct => {
  if (!isNumber(pct)) return null;
  const arrow = pct > 0 ? '▲ ' : pct < 0 ? '▼ ' : '';
  return `${arrow}${Math.abs(pct)}% new enrollments vs previous ${TREND_WINDOW_DAYS} days`;
};

/** "+3 vs previous 30 days"; hidden (null) when there is no change. */
export const certificatesSubline = delta => {
  if (!isNumber(delta) || delta === 0) return null;
  return `${delta > 0 ? '+' : ''}${delta} vs previous ${TREND_WINDOW_DAYS} days`;
};

export const buildKpiCards = (kpis = {}) => [
  {
    id: 'programs',
    icon: 'programs',
    stat: { label: 'Programs', value_display: String(kpis.programs_total ?? 0) },
    subline: `${kpis.programs_live ?? 0} live`,
  },
  {
    id: 'enrolled',
    icon: 'learners',
    stat: { label: 'Enrolled learners', value_display: String(kpis.enrolled ?? 0) },
    subline: trendSubline(kpis.enrolled_trend_pct),
  },
  {
    id: 'certificates',
    icon: 'certificates',
    stat: { label: 'Certificates issued', value_display: String(kpis.certificates_issued ?? 0) },
    subline: certificatesSubline(kpis.certificates_delta),
  },
  {
    id: 'completion',
    icon: 'completion',
    stat: { label: 'Completion rate', value_display: `${kpis.completion_rate ?? 0}%` },
    subline: null,
  },
];

// --- weekly chart ----------------------------------------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-08-10" -> "Aug 10" without going through Date (no time-zone shifts). */
export const weekLabel = weekStart => {
  const [, month, day] = String(weekStart).split('-');
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${Number(day)}` : String(weekStart);
};

export const buildChartSeries = (weekly = []) => ({
  categories: weekly.map(week => weekLabel(week.week_start)),
  series: [
    { name: 'Enrollments', data: weekly.map(week => week.enrollments ?? 0) },
    { name: 'Completions', data: weekly.map(week => week.completions ?? 0) },
  ],
});

const MAX_TICKS = 5;

/**
 * Y-axis scale with whole-number ticks only: starts at 0 and never ends below 1 (an all-zero chart still
 * gets a 0–1 axis). Up to 5 the axis has one tick per value; above that the top is rounded up to a multiple
 * of 5, so every one of the 5 steps is a whole number too.
 */
export const yAxisScale = (series = []) => {
  const peak = Math.max(1, ...series.flatMap(entry => entry.data.map(value => Math.ceil(value || 0))));
  if (peak <= MAX_TICKS) return { min: 0, max: peak, tickAmount: peak };
  return { min: 0, max: Math.ceil(peak / MAX_TICKS) * MAX_TICKS, tickAmount: MAX_TICKS };
};

const CHART_HEIGHT = 280;
const wholeNumber = value => String(Math.round(value));

/** ApexCharts options for the weekly grouped-bar chart. `palette` is the MUI theme palette. */
export const buildBarChartOptions = (palette, categories, scale) => ({
  chart: { type: 'bar', height: CHART_HEIGHT, width: '100%', toolbar: { show: false }, fontFamily: 'inherit', zoom: { enabled: false }, parentHeightOffset: 0 },
  colors: [palette.primary.main, palette.secondary.main],
  plotOptions: { bar: { horizontal: false, columnWidth: '60%', borderRadius: 3 } },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  fill: { opacity: 1 },
  grid: { borderColor: palette.divider, xaxis: { lines: { show: false } } },
  xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: palette.text.secondary } } },
  yaxis: {
    min: scale.min,
    max: scale.max,
    tickAmount: scale.tickAmount,
    forceNiceScale: false,
    decimalsInFloat: 0,
    labels: { formatter: wholeNumber, style: { colors: palette.text.secondary } },
  },
  legend: { position: 'top', horizontalAlign: 'right', markers: { size: 6 } },
  tooltip: { shared: true, intersect: false, y: { formatter: wholeNumber } },
});

// --- needs your attention --------------------------------------------------------------------------------

const ATTENTION_ROWS = [
  {
    key: 'submissions_to_grade',
    text: count => `${count} ${plural(count, 'submission')} waiting for a grade`,
    actionLabel: 'Review',
  },
  {
    key: 'inactive_learners',
    text: (count, item) =>
      isNumber(item.inactive_days)
        ? `${count} ${plural(count, 'learner')} inactive for ${item.inactive_days}+ days`
        : `${count} inactive ${plural(count, 'learner')}`,
    actionLabel: null,
  },
  {
    key: 'draft_programs',
    text: count => `${count} draft ${plural(count, 'program')} not yet published`,
    actionLabel: 'View drafts',
  },
];

/** Rows with a count above 0, in a fixed order. `route` is null unless the API sent one that exists in the app. */
export const attentionRows = (attention = {}) =>
  ATTENTION_ROWS.flatMap(row => {
    const item = attention[row.key] || {};
    if (!isNumber(item.count) || item.count <= 0) return [];
    const route = resolveRoute(item.route);
    return [{
      key: row.key,
      count: item.count,
      text: row.text(item.count, item),
      route,
      actionLabel: route ? row.actionLabel : null,
    }];
  });

// --- learner journey -------------------------------------------------------------------------------------

const FUNNEL_STAGES = [
  ['enrolled', 'Enrolled'],
  ['started', 'Started'],
  ['halfway', 'Halfway'],
  ['completed', 'Completed'],
  ['certified', 'Certified'],
];

/** Bar widths are a percentage of everyone who enrolled (0 for all stages when nobody has). */
export const funnelBars = (funnel = {}) => {
  const enrolled = funnel.enrolled || 0;
  return FUNNEL_STAGES.map(([key, label]) => {
    const count = funnel[key] || 0;
    return { key, label, count, percent: enrolled > 0 ? Math.min(100, Math.round((count * 100) / enrolled)) : 0 };
  });
};

// --- recent activity -------------------------------------------------------------------------------------

const ACTIVITY_ACTIONS = {
  enrolled: 'enrolled in',
  assignment_submitted: 'submitted an assignment in',
  quiz_submitted: 'submitted a quiz in',
  certificate_issued: 'earned a certificate in',
};
const ACTIVITY_DOT_COLORS = {
  enrolled: '#2E7D32',
  assignment_submitted: '#F59E0B',
  quiz_submitted: '#F59E0B',
  certificate_issued: '#1E4D35',
};

const RELATIVE_TIME_DAYS = 7;

/**
 * Within the last 7 days: relative ("2 days ago"). Older: a short date ("Sep 27", with the year when it is
 * not this year). Never negative: a timestamp slightly ahead of the clock reads as "a few seconds ago".
 */
export const timeAgo = (iso, now = Date.now()) => {
  const then = dayjs(iso);
  if (!then.isValid()) return '';
  const reference = dayjs(now);
  if (!then.isBefore(reference)) return 'a few seconds ago';
  if (reference.diff(then, 'day', true) < RELATIVE_TIME_DAYS) return then.from(reference);
  return then.format(then.year() === reference.year() ? 'MMM D' : 'MMM D, YYYY');
};

/** The full date and time, for the tooltip on the relative time. */
export const fullDateTime = iso => {
  const value = dayjs(iso);
  return value.isValid() ? value.format('MMM D, YYYY h:mm A') : '';
};

/** Items of a known type only, as parts of a sentence (the component renders them; nothing is markup). */
export const activityEntries = (items = [], now = Date.now()) =>
  items.flatMap((item, index) => {
    const action = ACTIVITY_ACTIONS[item?.type];
    if (!action) return [];
    return [{
      key: `${item.type}-${item.occurred_at}-${index}`,
      name: item.learner_name || FALLBACK_NAME,
      action,
      program: item.program_title || 'a program',
      timeAgo: timeAgo(item.occurred_at, now),
      timeTitle: fullDateTime(item.occurred_at),
      dotColor: ACTIVITY_DOT_COLORS[item.type],
    }];
  });

// --- program cards ---------------------------------------------------------------------------------------

const STATUS_LABELS = { public: 'Published', draft: 'Draft', archived: 'Archived', private: 'Private' };
const PACING_LABELS = { self_paced: 'Self-paced', cohort: 'Cohort', hybrid: 'Hybrid' };

export const programStatusLabel = status => STATUS_LABELS[status] || (status ? status[0].toUpperCase() + status.slice(1) : '');
export const pacingLabel = pacing => PACING_LABELS[pacing] || null;
export const priceLabel = program => (program.is_free ? 'Free' : `${program.currency || ''} ${program.price}`.trim());
export const editLabel = status => (status === 'draft' ? 'Continue draft' : 'Edit program');
