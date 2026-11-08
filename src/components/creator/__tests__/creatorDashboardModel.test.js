// Pure rules of the creator dashboard (KPI text, trend rules, attention rows, activity wording, routes).
// No React, no harness needed:
//   node -r sucrase/register --test src/components/creator/__tests__/creatorDashboardModel.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const model = require('../dashboardModel');

const APP_DIR = path.resolve(__dirname, '../../../app');

/** True when `route` resolves to a page.jsx under src/app (a literal folder wins, then a [param] folder). */
const routeHasPage = route => {
  let dir = APP_DIR;
  for (const segment of route.split('/').filter(Boolean)) {
    const children = fs.readdirSync(dir, { withFileTypes: true }).filter(entry => entry.isDirectory());
    const next = children.find(entry => entry.name === segment) || children.find(entry => /^\[[^\]]+\]$/.test(entry.name));
    if (!next) return false;
    dir = path.join(dir, next.name);
  }
  return fs.existsSync(path.join(dir, 'page.jsx'));
};

// --- KPI row ------------------------------------------------------------------------------------------------

test('the four KPI cards: programs with "N live", enrolled, certificates, completion rate', () => {
  const cards = model.buildKpiCards({
    programs_total: 4, programs_live: 2, enrolled: 120, enrolled_trend_pct: 26,
    certificates_issued: 40, certificates_delta: 3, completion_rate: 33,
  });
  assert.deepEqual(cards.map(card => card.stat.label), ['Programs', 'Enrolled learners', 'Certificates issued', 'Completion rate']);
  assert.deepEqual(cards.map(card => card.stat.value_display), ['4', '120', '40', '33%']);
  assert.equal(cards[0].subline, '2 live');
  assert.equal(cards[1].subline, '▲ 26% new enrollments vs previous 30 days');
  assert.equal(cards[2].subline, '+3 vs previous 30 days');
});

test('the enrolled trend is a muted sub-line that says what it measures; the big number is untouched', () => {
  assert.equal(model.trendSubline(null), null);
  assert.equal(model.trendSubline(undefined), null);
  assert.equal(model.trendSubline(26), '▲ 26% new enrollments vs previous 30 days');
  assert.equal(model.trendSubline(-100), '▼ 100% new enrollments vs previous 30 days');
  assert.equal(model.trendSubline(0), '0% new enrollments vs previous 30 days');

  const [, enrolled] = model.buildKpiCards({ enrolled: 2, enrolled_trend_pct: -100 });
  assert.equal(enrolled.stat.value_display, '2');
  assert.equal(enrolled.subline, '▼ 100% new enrollments vs previous 30 days');
  // no corner badge: that red "▼ 100%" next to a total of 2 read as lost learners
  assert.equal('change_percent' in enrolled.stat, false);
  assert.equal('live_label' in enrolled.stat, false);
  assert.equal(model.buildKpiCards({ enrolled: 5, enrolled_trend_pct: null })[1].subline, null);
});

test('the certificates line is hidden at 0, signed otherwise', () => {
  assert.equal(model.certificatesSubline(0), null);
  assert.equal(model.certificatesSubline(null), null);
  assert.equal(model.certificatesSubline(5), '+5 vs previous 30 days');
  assert.equal(model.certificatesSubline(-2), '-2 vs previous 30 days');
});

test('an empty kpis object renders zeros instead of "undefined"', () => {
  const cards = model.buildKpiCards({});
  assert.deepEqual(cards.map(card => card.stat.value_display), ['0', '0', '0', '0%']);
  assert.equal(cards[0].subline, '0 live');
});

// --- chart ---------------------------------------------------------------------------------------------------

test('weekly points become two series with "Mon D" labels (no time-zone shift)', () => {
  const { categories, series } = model.buildChartSeries([
    { week_start: '2026-08-10', enrollments: 2, completions: 1 },
    { week_start: '2026-09-07', enrollments: 0, completions: 0 },
  ]);
  assert.deepEqual(categories, ['Aug 10', 'Sep 7']);
  assert.deepEqual(series, [
    { name: 'Enrollments', data: [2, 0] },
    { name: 'Completions', data: [1, 0] },
  ]);
  assert.equal(model.weekLabel('2026-01-01'), 'Jan 1');
});

test('y-axis ticks are whole numbers, start at 0 and never end below 1', () => {
  const series = values => [{ name: 'a', data: values }, { name: 'b', data: [] }];
  assert.deepEqual(model.yAxisScale(series([0, 0, 0])), { min: 0, max: 1, tickAmount: 1 }); // all zero still renders
  assert.deepEqual(model.yAxisScale(series([])), { min: 0, max: 1, tickAmount: 1 });
  assert.deepEqual(model.yAxisScale(series([1, 0, 1])), { min: 0, max: 1, tickAmount: 1 });
  assert.deepEqual(model.yAxisScale(series([2, 3])), { min: 0, max: 3, tickAmount: 3 });
  assert.deepEqual(model.yAxisScale(series([7, 2])), { min: 0, max: 10, tickAmount: 5 }); // steps of 2
  assert.deepEqual(model.yAxisScale(series([23])), { min: 0, max: 25, tickAmount: 5 }); // steps of 5

  [[0], [1], [2], [3], [4], [5], [6], [7], [9], [11], [23], [48], [101], [999]].forEach(([peak]) => {
    const { min, max, tickAmount } = model.yAxisScale(series([peak]));
    assert.equal(min, 0);
    assert.ok(max >= peak && max >= 1, `peak ${peak}`);
    assert.equal(Number.isInteger(max / tickAmount), true, `peak ${peak}: ${max}/${tickAmount} is not a whole step`);
  });
});

test('the chart is grouped bars with whole-number labels and tooltip, coloured from the theme palette', () => {
  const palette = { primary: { main: 'P' }, secondary: { main: 'S' }, divider: 'D', text: { secondary: 'T' } };
  const options = model.buildBarChartOptions(palette, ['Aug 10'], model.yAxisScale([{ data: [0] }]));
  assert.equal(options.chart.type, 'bar');
  assert.equal(options.plotOptions.bar.horizontal, false);
  assert.equal(options.chart.stacked, undefined); // grouped, not stacked
  assert.deepEqual(options.colors, ['P', 'S']);
  assert.equal(options.legend.position, 'top');
  assert.equal(options.tooltip.shared, true);
  assert.equal(options.yaxis.min, 0);
  assert.equal(options.yaxis.max, 1);
  assert.equal(options.yaxis.decimalsInFloat, 0);
  assert.equal(options.yaxis.forceNiceScale, false);
  assert.equal(options.yaxis.labels.formatter(2.4), '2');
  assert.equal(options.yaxis.labels.formatter(0.5), '1');
  assert.equal(options.tooltip.y.formatter(3), '3');
});

// --- needs your attention --------------------------------------------------------------------------------------

test('attention rows: zero counts are dropped, wording uses inactive_days from the response', () => {
  const rows = model.attentionRows({
    submissions_to_grade: { count: 1, route: '/portal/teacher/certification/grading' },
    inactive_learners: { count: 7, inactive_days: 21 },
    draft_programs: { count: 0, route: '/portal/teacher/certification/programs' },
  });
  assert.deepEqual(rows.map(row => row.key), ['submissions_to_grade', 'inactive_learners']);
  assert.equal(rows[0].text, '1 submission waiting for a grade');
  assert.equal(rows[1].text, '7 learners inactive for 21+ days');
  assert.deepEqual(model.attentionRows({}), []);
  assert.deepEqual(model.attentionRows({ draft_programs: { count: 0 } }), []);
});

test('an attention row only gets a button when the route is given AND exists in the app', () => {
  const rows = model.attentionRows({
    submissions_to_grade: { count: 2, route: '/portal/institution/certification/grading' },
    draft_programs: { count: 3, route: '/portal/teacher/this-page-does-not-exist' },
    inactive_learners: { count: 4, inactive_days: 14 },
  });
  const byKey = Object.fromEntries(rows.map(row => [row.key, row]));
  assert.deepEqual([byKey.submissions_to_grade.route, byKey.submissions_to_grade.actionLabel],
    ['/portal/institution/certification/grading', 'Review']);
  assert.deepEqual([byKey.draft_programs.route, byKey.draft_programs.actionLabel], [null, null]); // route does not exist
  assert.deepEqual([byKey.inactive_learners.route, byKey.inactive_learners.actionLabel], [null, null]); // none sent
  assert.equal(byKey.draft_programs.count, 3); // the count is still shown
});

test('every route the dashboard can link to has a page in src/app', () => {
  model.EXISTING_ROUTES.forEach(route => assert.equal(routeHasPage(route), true, route));
  ['qte', 'institution'].forEach(type => {
    const routes = model.creatorRoutes(type);
    [routes.programs, routes.grading, routes.newProgram, routes.builder(12), routes.preview(12)].forEach(route =>
      assert.equal(routeHasPage(route), true, `${type}: ${route}`)
    );
  });
  assert.equal(routeHasPage('/portal/help-support'), true);
  assert.equal(routeHasPage('/portal/teacher/this-page-does-not-exist'), false); // the checker itself can say no
});

test('routes per creator type: institutions never get teacher-portal links', () => {
  const institution = model.creatorRoutes('institution');
  const everything = [institution.programs, institution.grading, institution.newProgram, institution.builder(3), institution.preview(3)];
  everything.forEach(route => assert.doesNotMatch(route, /\/portal\/teacher\//, route));
  assert.equal(institution.builder(3), '/portal/institution/certification/programs/builder/3');
  assert.equal(model.creatorRoutes('qte').builder(3), '/portal/teacher/certification/programs/builder/3');
  assert.equal(model.creatorRoutes(undefined).newProgram, '/portal/teacher/certification/programs/builder/new');
});

test('only an approved creator enables the data requests', () => {
  assert.equal(model.isCreatorDashboardEnabled('approved'), true);
  ['draft', 'submitted', 'under_review', 'rejected', 'suspended', undefined, null, ''].forEach(status =>
    assert.equal(model.isCreatorDashboardEnabled(status), false, String(status))
  );
});

// --- funnel --------------------------------------------------------------------------------------------------

test('the funnel has five stages, widths are a share of everyone enrolled, 0 when nobody is', () => {
  const bars = model.funnelBars({ enrolled: 200, started: 100, halfway: 50, completed: 20, certified: 10 });
  assert.deepEqual(bars.map(bar => bar.label), ['Enrolled', 'Started', 'Halfway', 'Completed', 'Certified']);
  assert.deepEqual(bars.map(bar => bar.percent), [100, 50, 25, 10, 5]);
  assert.deepEqual(bars.map(bar => bar.count), [200, 100, 50, 20, 10]);
  assert.deepEqual(model.funnelBars({}).map(bar => bar.percent), [0, 0, 0, 0, 0]);
});

// --- recent activity -----------------------------------------------------------------------------------------

test('activity wording per type, relative time, unknown types dropped, no email field is ever read', () => {
  const now = Date.parse('2026-10-30T12:00:00Z');
  const entries = model.activityEntries([
    { type: 'enrolled', learner_name: 'Jane D.', program_title: 'Yoga 101', occurred_at: '2026-10-30T11:58:00Z', learner_email: 'jane@example.com' },
    { type: 'assignment_submitted', learner_name: 'Ravi K.', program_title: 'Yoga 101', occurred_at: '2026-10-30T09:00:00Z' },
    { type: 'quiz_submitted', learner_name: 'Ana P.', program_title: 'Breath', occurred_at: '2026-10-28T12:00:00Z' },
    { type: 'certificate_issued', learner_name: '', program_title: 'Breath', occurred_at: '2026-10-30T11:59:50Z' },
    { type: 'certificate_verified', learner_name: 'X', program_title: 'Y', occurred_at: '2026-10-30T11:00:00Z' },
  ], now);
  assert.deepEqual(entries.map(entry => `${entry.name} ${entry.action} ${entry.program}`), [
    'Jane D. enrolled in Yoga 101',
    'Ravi K. submitted an assignment in Yoga 101',
    'Ana P. submitted a quiz in Breath',
    'A learner earned a certificate in Breath',
  ]);
  assert.deepEqual(entries.map(entry => entry.timeAgo), ['2 minutes ago', '3 hours ago', '2 days ago', 'a few seconds ago']);
  assert.ok(entries.every(entry => /^[A-Z][a-z]{2} \d{1,2}, \d{4} \d{1,2}:\d{2} (AM|PM)$/.test(entry.timeTitle)), 'full date-time for the tooltip');
  assert.doesNotMatch(JSON.stringify(entries), /@|email/);
});

test('timestamps: relative within 7 days, a short date ("Sep 27") after that, full date-time as the tooltip', () => {
  const now = Date.parse('2026-10-30T12:00:00Z');
  assert.equal(model.timeAgo('2026-10-28T12:00:00Z', now), '2 days ago');
  assert.equal(model.timeAgo('2026-10-25T12:00:00Z', now), '5 days ago');
  assert.equal(model.timeAgo('2026-10-24T12:00:00Z', now), '6 days ago');
  assert.equal(model.timeAgo('2026-10-30T11:00:00Z', now), 'an hour ago');
  // older than 7 days -> the short date, in the viewer's time zone like the rest of the portal's dayjs dates
  const older = '2026-09-27T12:00:00Z';
  assert.equal(model.timeAgo(older, now), require('dayjs')(older).format('MMM D'));
  assert.match(model.timeAgo(older, now), /^Sep 2[6-8]$/);
  assert.match(model.timeAgo('2025-01-15T12:00:00Z', now), /^Jan 1[45], 2025$/); // other year -> year shown
  assert.equal(model.timeAgo('2026-10-22T11:00:00Z', now), require('dayjs')('2026-10-22T11:00:00Z').format('MMM D')); // 8 d 1 h
  assert.match(model.fullDateTime('2026-09-27T12:00:00Z'), /^Sep 2[6-8], 2026 \d{1,2}:00 (AM|PM)$/);
});

test('timeAgo handles bad input and a timestamp ahead of the clock', () => {
  const now = Date.parse('2026-10-30T12:00:00Z');
  assert.equal(model.timeAgo('not a date', now), '');
  assert.equal(model.fullDateTime('not a date'), '');
  assert.equal(model.timeAgo('2026-10-30T13:00:00Z', now), 'a few seconds ago'); // never a negative time
});

// --- program cards -------------------------------------------------------------------------------------------

test('program card labels', () => {
  assert.deepEqual(['public', 'draft', 'archived', 'private'].map(model.programStatusLabel), ['Published', 'Draft', 'Archived', 'Private']);
  assert.equal(model.pacingLabel('self_paced'), 'Self-paced');
  assert.equal(model.pacingLabel(null), null);
  assert.equal(model.priceLabel({ is_free: true, price: '0.00', currency: 'USD' }), 'Free');
  assert.equal(model.priceLabel({ is_free: false, price: '49.00', currency: 'USD' }), 'USD 49.00');
  assert.equal(model.editLabel('draft'), 'Continue draft');
  assert.equal(model.editLabel('public'), 'Edit program');
});
