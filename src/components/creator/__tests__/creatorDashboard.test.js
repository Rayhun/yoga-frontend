// Server-render smoke tests for the creator dashboard (approved, zero programs, not approved, errors, QTE and
// Institution wiring). They check markup text and which requests are enabled — NOT appearance (nothing was
// looked at in a browser):
//
//   node -r sucrase/register -r ./src/components/certification/learner/__tests__/harness.cjs \
//        --test src/components/creator/__tests__/
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');
const path = require('path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const harness = require('../../certification/learner/__tests__/harness.cjs');

// What the stubbed requests answer. `payload` is the API body (the envelope's `data`); the real `select` runs on it.
const scenario = {
  calls: [],
  summary: { state: 'ok', payload: null },
  activity: { state: 'ok', payload: [] },
  application: null,
};
const respond = (opts, entry) => {
  if (entry.state === 'loading') return { data: undefined, isLoading: true, isError: false, refetch() {} };
  if (entry.state === 'error') return { data: undefined, isLoading: false, isError: true, refetch() {} };
  const response = { data: { data: entry.payload } };
  return { data: opts.select ? opts.select(response) : response, isLoading: false, isError: false, refetch() {} };
};
const stubs = {
  '@tanstack/react-query': {
    useQuery: opts => {
      scenario.calls.push({ key: opts.queryKey, enabled: opts.enabled !== false, staleTime: opts.staleTime });
      if (opts.enabled === false) return { data: undefined, isLoading: false, isError: false, refetch() {} };
      const [first, second] = opts.queryKey;
      if (first === 'creator-dashboard') return respond(opts, scenario[second]);
      return { data: opts.select ? opts.select({ data: scenario.application }) : scenario.application, isLoading: false, isError: false };
    },
    useMutation: () => ({ mutateAsync: async () => ({}), isPending: false }),
    useQueryClient: () => ({ invalidateQueries() {} }),
  },
  // the chart is loaded with next/dynamic (ssr:false); a marker stands in for it
  'next/dynamic': () => props => React.createElement('div', { 'data-chart': `${(props.weekly || []).length} weeks` }),
  '@/utils/query-keys': { __esModule: true, default: require('../../../utils/query-keys').default },
};
const previousLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (Object.prototype.hasOwnProperty.call(stubs, request)) return stubs[request];
  return previousLoad.apply(this, arguments);
};

const CreatorDashboard = require('../CreatorDashboard').default;
const QteDashboard = require('../../qte/QteDashboard').default;
const InstitutionDashboardContent = require('../../certification/apply/InstitutionDashboardContent').default;

const WEEKLY = Array.from({ length: 12 }, (_, index) => ({
  week_start: `2026-08-${String(10 + index).padStart(2, '0')}`, enrollments: index, completions: 0,
}));
const summaryFixture = (overrides = {}) => ({
  kpis: {
    programs_total: 3, programs_live: 2, enrolled: 120, enrolled_trend_pct: 26,
    certificates_issued: 40, certificates_delta: 5, completion_rate: 33, ...overrides.kpis,
  },
  weekly: WEEKLY,
  attention: {
    submissions_to_grade: { count: 4, route: '/portal/teacher/certification/grading' },
    inactive_learners: { count: 7, inactive_days: 14 },
    draft_programs: { count: 1, route: '/portal/teacher/certification/programs' },
    ...overrides.attention,
  },
  funnel: { enrolled: 120, started: 90, halfway: 60, completed: 40, certified: 40 },
  programs: [
    { id: 7, title: 'Gentle Yoga Teacher Training', status: 'public', modules_count: 6, pacing: 'self_paced', price: '199.00', currency: 'USD', is_free: false, enrolled: 80, certified: 30, completion_rate: 38 },
    { id: 8, title: 'Breathwork Basics', status: 'draft', modules_count: 1, pacing: null, price: '0.00', currency: 'USD', is_free: true, enrolled: 0, certified: 0, completion_rate: 0 },
  ],
  ...overrides.rest,
});
const ACTIVITY = [
  { type: 'enrolled', learner_name: 'Jane D.', program_title: 'Gentle Yoga Teacher Training', occurred_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { type: 'quiz_submitted', learner_name: 'Ravi K.', program_title: 'Breathwork Basics', occurred_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
];

const reset = () => {
  harness.reset();
  scenario.calls = [];
  scenario.summary = { state: 'ok', payload: summaryFixture() };
  scenario.activity = { state: 'ok', payload: ACTIVITY };
  scenario.application = { application_status: 'approved', creator_type: 'institution' };
};
const render = props => renderToStaticMarkup(React.createElement(CreatorDashboard, props));
const dashboardRequests = () => scenario.calls.filter(call => call.key[0] === 'creator-dashboard');
const indexesInOrder = (html, markers) => markers.map(marker => {
  const index = html.indexOf(marker);
  assert.notEqual(index, -1, `missing: ${marker}`);
  return index;
});

// --- approved ------------------------------------------------------------------------------------------------

test('approved QTE: every block is there, in the order KPIs, chart, attention, funnel, activity, programs', () => {
  reset();
  const html = render({ creatorType: 'qte', applicationStatus: 'approved' });
  const indexes = indexesInOrder(html, [
    'QTE Dashboard', 'Programs', 'Enrolled learners', 'Certificates issued', 'Completion rate',
    'Enrollments and completions', 'Last 12 weeks', 'Needs your attention',
    'Where learners are in the journey', 'Recent activity', 'Your programs',
  ]);
  assert.deepEqual(indexes, [...indexes].sort((a, b) => a - b));
  assert.match(html, /2 live/);
  assert.match(html, /▲ 26% new enrollments vs previous 30 days/); // enrolled trend, as a sub-line
  assert.doesNotMatch(html, /absolute right-4 top-4/); // no corner badge
  assert.match(html, /\+5 vs previous 30 days/);
  assert.match(html, /33%/);
  assert.match(html, /data-chart="12 weeks"/);
});

test('approved: the two requests are enabled with the agreed keys and a stale time', () => {
  reset();
  render({ creatorType: 'qte', applicationStatus: 'approved' });
  const calls = dashboardRequests();
  assert.deepEqual(calls.map(call => call.key), [['creator-dashboard', 'summary'], ['creator-dashboard', 'activity']]);
  assert.ok(calls.every(call => call.enabled && call.staleTime > 0));
});

test('attention card: counts, wording with inactive_days, buttons only for routes that exist', () => {
  reset();
  scenario.summary.payload = summaryFixture({
    attention: { draft_programs: { count: 1, route: '/portal/teacher/this-page-does-not-exist' } },
  });
  const html = render({ creatorType: 'qte', applicationStatus: 'approved' });
  assert.match(html, /4 submissions waiting for a grade/);
  assert.match(html, /7 learners inactive for 14\+ days/);
  assert.match(html, /1 draft program not yet published/);
  assert.match(html, /href="\/portal\/teacher\/certification\/grading"/);
  assert.doesNotMatch(html, /this-page-does-not-exist/);
  assert.doesNotMatch(html, /View drafts/); // count shown, no button
});

test('attention card: all zero -> "Nothing needs your attention"', () => {
  reset();
  scenario.summary.payload = summaryFixture({
    attention: {
      submissions_to_grade: { count: 0, route: '/portal/teacher/certification/grading' },
      inactive_learners: { count: 0, inactive_days: 14 },
      draft_programs: { count: 0, route: '/portal/teacher/certification/programs' },
    },
  });
  assert.match(render({ creatorType: 'qte', applicationStatus: 'approved' }), /Nothing needs your attention/);
});

test('the enrolled trend and the certificates line are hidden when null / 0', () => {
  reset();
  scenario.summary.payload = summaryFixture({ kpis: { enrolled_trend_pct: null, certificates_delta: 0 } });
  const html = render({ creatorType: 'qte', applicationStatus: 'approved' });
  assert.doesNotMatch(html, /▲|▼/);
  assert.doesNotMatch(html, /vs previous 30 days/);
});

test('typography: card titles and KPI numbers use the page-title font (no serif); the Expert card keeps its own', () => {
  reset();
  const html = render({ creatorType: 'qte', applicationStatus: 'approved' });
  assert.doesNotMatch(html, /font-serif/);
  const StatCard = require('../../common/dashboard/StatCard').default;
  const expertCard = renderToStaticMarkup(React.createElement(StatCard, { stat: { value_display: '5', label: 'Members' }, Icon: () => null }));
  assert.match(expertCard, /font-serif/); // the Expert dashboard looks exactly as before
});

test('funnel lists the five stages with their counts', () => {
  reset();
  const html = render({ creatorType: 'qte', applicationStatus: 'approved' });
  ['Enrolled', 'Started', 'Halfway', 'Completed', 'Certified'].forEach(label => assert.match(html, new RegExp(`>${label}<`)));
  assert.match(html, />120</);
  assert.match(html, />90</);
});

test('recent activity: sentence per type, relative time, names only', () => {
  reset();
  const html = render({ creatorType: 'qte', applicationStatus: 'approved' });
  assert.match(html, /<strong>Jane D\.<\/strong> enrolled in <strong>Gentle Yoga Teacher Training<\/strong>/);
  assert.match(html, /<strong>Ravi K\.<\/strong> submitted a quiz in <strong>Breathwork Basics<\/strong>/);
  assert.match(html, /5 minutes ago/);
  assert.match(html, /3 hours ago/);
  assert.match(html, /title="[A-Z][a-z]{2} \d{1,2}, \d{4} \d{1,2}:\d{2} (AM|PM)"/); // full date-time tooltip
  assert.doesNotMatch(html, /@/);
});

test('recent activity: empty state', () => {
  reset();
  scenario.activity.payload = [];
  assert.match(render({ creatorType: 'qte', applicationStatus: 'approved' }), /No activity yet/);
});

test('program cards: status chip, modules, pacing, price / Free, numbers, Edit or Continue draft, plus the New card', () => {
  reset();
  const html = render({ creatorType: 'qte', applicationStatus: 'approved' });
  assert.match(html, />Published</);
  assert.match(html, />Draft</);
  assert.match(html, /6 modules · Self-paced · USD 199\.00/);
  assert.match(html, /1 module · Free/);
  assert.match(html, />Edit program</);
  assert.match(html, />Continue draft</);
  assert.match(html, /New certification program/);
  assert.match(html, /href="\/portal\/teacher\/certification\/programs\/builder\/7"/);
  assert.match(html, /href="\/portal\/teacher\/certification\/programs\/builder\/new"/);
});

test('approved Institution: every link points into the institution portal, none into the teacher portal', () => {
  reset();
  scenario.summary.payload = summaryFixture({
    attention: {
      submissions_to_grade: { count: 2, route: '/portal/institution/certification/grading' },
      draft_programs: { count: 1, route: '/portal/institution/programs' },
    },
  });
  const html = render({ creatorType: 'institution', applicationStatus: 'approved' });
  assert.match(html, /Institution Dashboard/);
  assert.match(html, /href="\/portal\/institution\/certification\/programs\/builder\/7"/);
  assert.match(html, /href="\/portal\/institution\/certification\/programs\/7\/preview"/);
  assert.match(html, /href="\/portal\/institution\/certification\/programs\/builder\/new"/);
  assert.match(html, /href="\/portal\/institution\/certification\/grading"/);
  assert.doesNotMatch(html, /\/portal\/teacher\//);
});

// --- zero programs -------------------------------------------------------------------------------------------

test('zero programs: KPI zeros stay, chart + funnel + program grid are replaced by one "first program" card', () => {
  reset();
  scenario.summary.payload = summaryFixture({
    kpis: { programs_total: 0, programs_live: 0, enrolled: 0, enrolled_trend_pct: null, certificates_issued: 0, certificates_delta: 0, completion_rate: 0 },
    attention: { submissions_to_grade: { count: 0 }, inactive_learners: { count: 0, inactive_days: 14 }, draft_programs: { count: 0 } },
    rest: { programs: [], weekly: WEEKLY.map(week => ({ ...week, enrollments: 0 })) },
  });
  const html = render({ creatorType: 'qte', applicationStatus: 'approved' });
  assert.match(html, /Create your first certification program/);
  assert.match(html, /Enrolled learners/);
  assert.match(html, />0%</);
  assert.doesNotMatch(html, /Enrollments and completions/);
  assert.doesNotMatch(html, /Where learners are in the journey/);
  assert.doesNotMatch(html, /Your programs/);
  assert.doesNotMatch(html, /data-chart/);
});

// --- loading and errors --------------------------------------------------------------------------------------

test('loading: skeletons, no numbers, no error', () => {
  reset();
  scenario.summary = { state: 'loading' };
  scenario.activity = { state: 'loading' };
  const html = render({ creatorType: 'qte', applicationStatus: 'approved' });
  assert.match(html, /role="status"/);
  assert.match(html, /MuiSkeleton/);
  assert.doesNotMatch(html, /role="alert"/);
});

test('a failed summary shows a retry on its cards while the activity card still renders', () => {
  reset();
  scenario.summary = { state: 'error' };
  const html = render({ creatorType: 'qte', applicationStatus: 'approved' });
  assert.match(html, /role="alert"/);
  assert.match(html, />Retry</);
  assert.match(html, /<strong>Jane D\.<\/strong> enrolled in/); // the activity card is intact
  assert.match(html, /QTE Dashboard/); // the page is not blank
});

test('a failed activity request leaves the numbers on screen', () => {
  reset();
  scenario.activity = { state: 'error' };
  const html = render({ creatorType: 'qte', applicationStatus: 'approved' });
  assert.match(html, /Gentle Yoga Teacher Training/);
  assert.match(html, /2 live/);
  assert.match(html, />Retry</);
});

// --- not approved --------------------------------------------------------------------------------------------

test('every not-approved status: only the status card, and neither endpoint is enabled', () => {
  const expectedText = {
    draft: null,
    submitted: /Application under review/,
    under_review: /Application under review/,
    rejected: /Application not approved/,
    suspended: /Account suspended/,
  };
  Object.entries(expectedText).forEach(([status, text]) => {
    reset();
    const html = render({ creatorType: 'qte', applicationStatus: status, rejectedReason: 'Add your certificates.', reapplyHref: '/portal/teacher/editProfile?reapply=1' });
    if (text) assert.match(html, text, status);
    ['Enrolled learners', 'Needs your attention', 'Recent activity', 'Your programs', 'New certification program'].forEach(label =>
      assert.doesNotMatch(html, new RegExp(label), `${status}: ${label}`)
    );
    const requests = dashboardRequests();
    assert.equal(requests.length, 2, status); // hooks still run…
    assert.ok(requests.every(call => call.enabled === false), `${status}: a dashboard request was enabled`);
  });
});

test('rejected shows the reason and the re-apply link; suspended shows the support link', () => {
  reset();
  const rejected = render({ creatorType: 'qte', applicationStatus: 'rejected', rejectedReason: 'Add your certificates.', reapplyHref: '/portal/teacher/editProfile?reapply=1' });
  assert.match(rejected, /Add your certificates\./);
  assert.match(rejected, /href="\/portal\/teacher\/editProfile\?reapply=1"/);
  const suspended = render({ creatorType: 'institution', applicationStatus: 'suspended' });
  assert.match(suspended, /href="\/portal\/help-support"/);
});

// --- wiring in the two real dashboards -----------------------------------------------------------------------

const teacher = (status, extra = {}) => ({ role: 'Teacher', creator_type: 'qte', application_status: status, rejected_reason: null, ...extra });

test('QteDashboard: approved renders the overview; submitted / under_review / rejected request nothing', () => {
  reset();
  harness.user = { profile: teacher('approved') };
  const approved = renderToStaticMarkup(React.createElement(QteDashboard));
  assert.match(approved, /Enrolled learners/);
  assert.match(approved, /QTE Dashboard/);
  assert.ok(dashboardRequests().every(call => call.enabled));

  ['submitted', 'under_review', 'rejected'].forEach(status => {
    reset();
    harness.user = { profile: teacher(status, { rejected_reason: 'No.' }) };
    const html = renderToStaticMarkup(React.createElement(QteDashboard));
    assert.match(html, /QTE Dashboard/, status);
    assert.doesNotMatch(html, /Enrolled learners/, status);
    assert.ok(dashboardRequests().every(call => !call.enabled), status);
  });
});

test('InstitutionDashboardContent: approved renders the overview with no "coming soon"; others only the status card', () => {
  reset();
  scenario.application = { application_status: 'approved', creator_type: 'institution' };
  const approved = renderToStaticMarkup(React.createElement(InstitutionDashboardContent));
  assert.match(approved, /Institution Dashboard/);
  assert.match(approved, /Enrolled learners/);
  assert.doesNotMatch(approved, /coming soon/i);

  ['submitted', 'under_review', 'rejected', 'suspended'].forEach(status => {
    reset();
    scenario.application = { application_status: status, creator_type: 'institution', rejected_reason: 'No.' };
    const html = renderToStaticMarkup(React.createElement(InstitutionDashboardContent));
    assert.doesNotMatch(html, /Enrolled learners/, status);
    assert.doesNotMatch(html, /coming soon/i, status);
    assert.ok(dashboardRequests().every(call => !call.enabled), status);
  });

  reset();
  scenario.application = null; // no application row at all -> treated as submitted, nothing requested
  renderToStaticMarkup(React.createElement(InstitutionDashboardContent));
  assert.ok(dashboardRequests().every(call => !call.enabled));
});

test('QteDashboard: suspended keeps its locked view and requests nothing', () => {
  reset();
  harness.user = { profile: teacher('suspended') };
  const html = renderToStaticMarkup(React.createElement(QteDashboard));
  assert.match(html, /Account suspended/);
  assert.equal(dashboardRequests().length, 0);
});

// The institution builder guard reads these two fields off GET apply/institution/me/ (which now carries
// creator_type). Pin what it checks so a rename on either side shows up.
test('institution builder guard checks creator_type === "institution" and application_status === "approved"', () => {
  const source = require('node:fs').readFileSync(
    path.resolve(__dirname, '../../../app/portal/institution/certification/programs/builder/layout.jsx'), 'utf8');
  assert.match(source, /data\?\.creator_type === 'institution'/);
  assert.match(source, /data\?\.application_status === 'approved'/);
});
