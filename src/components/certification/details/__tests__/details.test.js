// Flow tests for the learner program-detail tabs (Overview / Curriculum / Credentials). Server-rendered
// with stubbed framework pieces (shared harness); they check markup text and logic, NOT appearance.
//
//   node -r sucrase/register -r ./src/components/certification/learner/__tests__/harness.cjs \
//        --test src/components/certification/details/__tests__/
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const harness = require('../../learner/__tests__/harness.cjs');

const tabs = require('../detailTabs');
const ProgramDetailsView = require('../ProgramDetailsView').default;

const SECRET_URL = 'https://cdn.example.com/paid/secret-video.mp4';
const SECRET_TEXT = 'PAID LESSON BODY TEXT';

const lesson = (id, type, extra = {}) => ({
  id, title: `Lesson ${id}`, lesson_type: type, duration: null, order: id,
  // a response must never be able to leak these through the outline, even if it carried them
  content_url: SECRET_URL, text_content: SECRET_TEXT, ...extra,
});
const catalogProgram = (overrides = {}) => ({
  id: 5, title: 'Clinical Anatomy', is_enrolled: false, module_count: 2, lesson_count: 3,
  short_description: 'Short blurb', full_description: 'Full description of the track.',
  outcomes: 'Assess clients\nPlan sessions\n', target_audience: 'professional', level: 'Intermediate',
  duration_estimate: '6 weeks', language: 'English', completion_deadline_days: 90,
  modules: [
    { id: 1, title: 'Module One', description: 'First module', order: 1, lessons: [lesson(1, 'video', { duration: '12 min' }), lesson(2, 'quiz')] },
    { id: 2, title: 'Module Two', order: 2, lessons: [lesson(3, 'assignment')] },
  ],
  certificate_setting: null,
  ...overrides,
});

const page = (query = '') => {
  harness.url = new URLSearchParams(query);
  return renderToStaticMarkup(React.createElement(ProgramDetailsView, { programId: '5' }));
};
// { overview: {hidden: bool, html}, ... }
const panelsOf = html => {
  const result = {};
  const re = /<div id="program-panel-([a-z]+)" role="tabpanel"([^>]*)>([\s\S]*?)(?=<div id="program-panel-|$)/g;
  let match;
  while ((match = re.exec(html))) result[match[1]] = { hidden: / hidden=""/.test(match[2]), html: match[3] };
  return result;
};
const visiblePanel = html => Object.entries(panelsOf(html)).filter(([, panel]) => !panel.hidden).map(([id]) => id);

test.beforeEach(() => {
  harness.reset();
  harness.tabsProps = null;
  harness.detail = catalogProgram();
});

// --- tabs ----------------------------------------------------------------------------------------

test('exactly three tabs, Overview / Curriculum / Credentials, and the old labels are gone', () => {
  const html = page();
  const labels = [...html.matchAll(/<button[^>]*role="tab"[^>]*>([^<]*)</g)].map(match => match[1]);
  assert.deepEqual(labels, ['Overview', 'Curriculum', 'Credentials']);
  assert.equal((html.match(/role="tab"/g) || []).length, 3);
  assert.equal((html.match(/role="tabpanel"/g) || []).length, 3);
  assert.equal((html.match(/role="tablist"/g) || []).length, 1);
  for (const old of ['>About<', '>Outcomes<', 'Benefits', 'Journey']) assert.ok(!html.includes(old), old);
});

test('tabs are an accessible tablist: one tab stop, aria links, 44px targets, scrolls sideways', () => {
  const html = page('tab=curriculum');
  assert.match(html, /id="program-panel-curriculum-tab"[^>]*aria-controls="program-panel-curriculum"[^>]*aria-selected="true"[^>]*tabindex="0"/);
  assert.match(html, /aria-controls="program-panel-overview"[^>]*aria-selected="false"[^>]*tabindex="-1"/);
  assert.match(html, /aria-labelledby="program-panel-curriculum-tab"/);
  assert.equal((html.match(/min-h-\[44px\]/g) || []).length >= 3, true);
  assert.match(html, /role="tablist"[^>]*class="[^"]*overflow-x-auto/);
});

test('the URL param selects the tab; none or unknown falls back to Overview', () => {
  assert.deepEqual(visiblePanel(page()), ['overview']);
  assert.deepEqual(visiblePanel(page('tab=curriculum')), ['curriculum']);
  assert.deepEqual(visiblePanel(page('tab=credentials')), ['credentials']);
  assert.deepEqual(visiblePanel(page('tab=overview')), ['overview']);
  for (const bad of ['tab=journey', 'tab=', 'tab=CREDENTIALS', 'tab=about']) assert.deepEqual(visiblePanel(page(bad)), ['overview'], bad);
  assert.equal(tabs.parseTab('credentials'), 'credentials');
  assert.equal(tabs.parseTab(null), 'overview');
});

test('choosing a tab writes ?tab= to the URL; Overview (the default) clears it', () => {
  page();
  harness.tabsProps.onSelect('credentials');
  harness.tabsProps.onSelect('curriculum');
  harness.tabsProps.onSelect('overview');
  assert.deepEqual(harness.sets, [['tab', 'credentials'], ['tab', 'curriculum'], ['tab', '']]);
});

// --- Overview ---------------------------------------------------------------------------------------

test('Overview shows description, objectives and the facts that exist, and never a prerequisites block', () => {
  const overview = panelsOf(page()).overview.html;
  assert.match(overview, /Full description of the track\./);
  assert.match(overview, /What you will learn/);
  assert.match(overview, /<li>Assess clients<\/li><li>Plan sessions<\/li>/);
  assert.match(overview, /Target audience<\/dt><dd[^>]*>Professional/);
  assert.match(overview, /Level<\/dt><dd[^>]*>Intermediate/);
  assert.match(overview, /Duration<\/dt><dd[^>]*>6 weeks/);
  assert.doesNotMatch(overview, /[Pp]rerequisite/);
});

test('Overview leaves out facts and objectives the program does not have', () => {
  harness.detail = catalogProgram({ outcomes: '', level: null, duration_estimate: '', language: undefined, full_description: null });
  const overview = panelsOf(page()).overview.html;
  assert.match(overview, /Short blurb/); // falls back to the short description
  assert.doesNotMatch(overview, /What you will learn|Level|Language/);
  harness.detail = catalogProgram({ full_description: '', short_description: '', outcomes: '', target_audience: null, level: '', duration_estimate: '', language: '' });
  assert.match(panelsOf(page()).overview.html, /No overview has been provided/);
});

// --- Curriculum ---------------------------------------------------------------------------------------

test('before enrollment Curriculum shows titles, types, durations and locks, and no content, URLs or links', () => {
  const html = page('tab=curriculum');
  const curriculum = panelsOf(html).curriculum.html;
  for (const title of ['Module One', 'Module Two', 'Lesson 1', 'Lesson 2', 'Lesson 3']) assert.match(curriculum, new RegExp(title));
  assert.match(curriculum, /2 Modules • 3 Lessons • 6 weeks/);
  assert.match(curriculum, /12 min/);
  assert.match(curriculum, /aria-label="Locked"/);
  assert.ok(!html.includes(SECRET_URL));
  assert.ok(!html.includes(SECRET_TEXT));
  assert.ok(!curriculum.includes('<a '), 'no lesson or module is a link before enrollment');
  assert.equal(harness.learnerCalls.length, 0, 'the lesson-content endpoint is not even called');
});

test('Singular wording for one module and one lesson', () => {
  harness.detail = catalogProgram({ module_count: 1, lesson_count: 1, duration_estimate: null, modules: [{ id: 1, title: 'Only', lessons: [lesson(1, 'pdf')] }] });
  assert.match(panelsOf(page('tab=curriculum')).curriculum.html, /1 Module • 1 Lesson</);
});

test('once enrolled, unlocked modules and lessons link on, locked ones stay locked, content is still not shown', () => {
  harness.detail = catalogProgram({ is_enrolled: true });
  harness.learner = catalogProgram({
    is_enrolled: true,
    modules: [
      { id: 1, title: 'Open Module', is_locked: false, lessons: [lesson(1, 'video')] },
      { id: 2, title: 'Shut Module', is_locked: true, lessons: [lesson(2, 'quiz')] },
    ],
  });
  const html = page('tab=curriculum');
  const curriculum = panelsOf(html).curriculum.html;
  assert.match(curriculum, /href="\/portal\/customer\/certification\/module\/1\/details\?program=5"/);
  assert.match(curriculum, /href="\/portal\/customer\/certification\/session\/1\/details\?program=5"/);
  assert.doesNotMatch(curriculum, /module\/2\/details|session\/2\/details/);
  assert.equal((curriculum.match(/aria-label="Locked"/g) || []).length, 1);
  assert.ok(!html.includes(SECRET_URL) && !html.includes(SECRET_TEXT));
});

test('lesson chips: every known type, and a neutral "Lesson" chip for a type the UI does not know', () => {
  const types = ['video', 'audio', 'pdf', 'image', 'text', 'quiz', 'assignment', 'link'];
  const labels = ['Video', 'Audio', 'PDF', 'Image', 'Reading', 'Quiz', 'Assignment', 'Link'];
  types.forEach((type, index) => {
    const chip = tabs.lessonChip(type);
    assert.equal(chip.label, labels[index], type);
    assert.equal(chip.known, true);
  });
  for (const unknown of ['hologram', '', undefined, null]) {
    const chip = tabs.lessonChip(unknown);
    assert.deepEqual([chip.label, chip.known, chip.type], ['Lesson', false, 'unknown']);
  }
  harness.detail = catalogProgram({
    modules: [{ id: 1, title: 'M', lessons: [...types.map((type, i) => lesson(i + 1, type)), lesson(99, 'hologram')] }],
  });
  const curriculum = panelsOf(page('tab=curriculum')).curriculum.html;
  for (const type of types) assert.match(curriculum, new RegExp(`data-chip="${type}"`), type);
  assert.match(curriculum, /data-chip="unknown"[^>]*>(?:<svg[\s\S]*?<\/svg>)? Lesson</);
});

// --- Credentials ---------------------------------------------------------------------------------------

test('Credentials without certificate data says so and shows no empty labels', () => {
  harness.detail = catalogProgram({ certificate_setting: null, completion_deadline_days: null });
  const credentials = panelsOf(page('tab=credentials')).credentials.html;
  assert.match(credentials, /Credential details have not been published/);
  assert.ok(!credentials.includes('data-block'));
});

test('Credentials renders only the blocks that have data', () => {
  harness.detail = catalogProgram({
    completion_deadline_days: null,
    certificate_setting: { certificate_title: 'Certified Clinical Practitioner', primary_issuer_name: '', co_issuer_name: null, completion_rules: '  ', expiry_period_days: null, certificate_id_prefix: 'CERT' },
  });
  const credentials = panelsOf(page('tab=credentials')).credentials.html;
  assert.deepEqual([...credentials.matchAll(/data-block="([a-z_]+)"/g)].map(match => match[1]), ['title']);
  assert.match(credentials, /Certified Clinical Practitioner/);
  assert.doesNotMatch(credentials, /Issued by|Co-issued|How to earn|deadline|Validity/i);
});

test('Credentials shows every block it has data for, in order', () => {
  harness.detail = catalogProgram({
    completion_deadline_days: 90,
    certificate_setting: {
      certificate_title: 'Certified Clinical Practitioner', primary_issuer_name: 'Dr. Jordan Lee', co_issuer_name: 'Acme Accreditation Board',
      completion_rules: 'Finish every required lesson.\nPass the final quiz.', expiry_period_days: 365,
    },
  });
  const credentials = panelsOf(page('tab=credentials')).credentials.html;
  assert.deepEqual(
    [...credentials.matchAll(/data-block="([a-z_]+)"/g)].map(match => match[1]),
    ['title', 'issuer', 'co_issuer', 'requirements', 'deadline', 'validity'],
  );
  assert.match(credentials, /Dr\. Jordan Lee/);
  assert.match(credentials, /Acme Accreditation Board/);
  assert.match(credentials, /Finish every required lesson\./);
  assert.match(credentials, /90 days after enrollment/);
  assert.match(credentials, /Valid for 365 days after issuance/);
});

test('Credentials never shows fields the API does not provide (CE hours, badge, verification ID, ...)', () => {
  harness.detail = catalogProgram({
    certificate_setting: { certificate_title: 'T', primary_issuer_name: 'I', completion_rules: 'R', expiry_period_days: 30, certificate_id_prefix: 'CERT' },
  });
  const credentials = panelsOf(page('tab=credentials')).credentials.html;
  for (const absent of [/CE hours/i, /Digital badge/i, /Verification/i, /Accreditation/i, /Prerequisite/i, /CERT/]) assert.doesNotMatch(credentials, absent);
});
