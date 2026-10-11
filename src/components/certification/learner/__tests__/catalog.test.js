// Flow tests for the Professional Tracks catalog page. Server-rendered with stubbed framework pieces
// (see harness.cjs); they check logic and markup text, NOT appearance.
const test = require('node:test');
const assert = require('node:assert/strict');
const { renderToStaticMarkup } = require('react-dom/server');
const harness = require('./harness.cjs');

const model = require('../catalogModel');
const ProgramCard = require('../ProgramCard').default;
const CatalogSection = require('../CatalogSection').default;
const TrackFilterPills = require('../TrackFilterPills').default;
const DiscoverPanel = require('../DiscoverPanel').default;

const program = (id, overrides = {}) => ({
  id, title: `Track ${id}`, track_type: null, is_recommended: false, module_count: 3, lesson_count: 12,
  price: '500.00', currency: 'USD', payment_type: 'one_time', seat_limit: null, seats_remaining: null,
  creator_type: 'qte', is_enrolled: false, ...overrides,
});
const catalogResponse = (programs, extra = {}) => ({
  data: { results: { data: { 'all-programs': programs, tags: [], categories: [], ...extra } } },
});
const enrolledResponse = programs => ({ data: { results: { data: { 'all-programs': programs } } } });
const render = element => renderToStaticMarkup(element);
const card = overrides => render(require('react').createElement(ProgramCard, { program: program(1, overrides), onClick() {} }));
const page = () => render(require('react').createElement(DiscoverPanel));

test.beforeEach(() => harness.reset());

// --- filter changes the request and the URL ---------------------------------------------------

test('All Tracks sends no track_type; a pill sends it; both lists get the same filter', () => {
  page();
  assert.equal(harness.catalogCalls.length, 2);
  assert.ok(harness.catalogCalls.every(params => !('track_type' in params)));
  assert.deepEqual(harness.catalogCalls.map(params => params.recommended), [undefined, 'true']);

  harness.reset();
  harness.url = new URLSearchParams('track_type=coaching_practice');
  page();
  assert.deepEqual(
    harness.catalogCalls.map(params => [params.track_type, params.recommended]),
    [['coaching_practice', undefined], ['coaching_practice', 'true']],
  );
});

test('an unknown ?track_type= in the URL is treated as All Tracks (the API would answer 400)', () => {
  harness.url = new URLSearchParams('track_type=surgical');
  page();
  assert.ok(harness.catalogCalls.every(params => !('track_type' in params)));
  assert.equal(harness.pills.selected, '');
});

test('the selected pill comes from the URL, so it survives a reload', () => {
  harness.url = new URLSearchParams('track_type=foundational');
  page();
  assert.equal(harness.pills.selected, 'foundational');
});

test('choosing a pill writes ?track_type= to the URL, All Tracks clears it', () => {
  page();
  harness.pills.onSelect('clinical');
  harness.pills.onSelect('');
  assert.deepEqual(harness.sets, [['track_type', 'clinical'], ['track_type', '']]); // "" makes useSearchParamUtils delete the key
});

test('the four pills, in order, call onSelect with their value and mark the active one', () => {
  const picked = [];
  const tree = TrackFilterPills({ selected: 'clinical', onSelect: value => picked.push(value) });
  const buttons = [];
  const walk = node => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (node.type === 'button') buttons.push(node);
    walk(node.props?.children);
  };
  walk(tree);
  assert.deepEqual(buttons.map(b => b.props.children), ['All Tracks', 'Clinical Tracks', 'Coaching & Practice Tracks', 'Foundational Tracks']);
  buttons.forEach(b => b.props.onClick());
  assert.deepEqual(picked, ['', 'clinical', 'coaching_practice', 'foundational']);
  assert.deepEqual(buttons.map(b => b.props['aria-pressed']), [false, true, false, false]);
  assert.ok(buttons.every(b => b.props.className.includes('min-h-[44px]')));
  assert.ok(tree.props.className.includes('flex-wrap'));
});

// --- empty states ----------------------------------------------------------------------------

test('All Tracks shows an empty state, plain when nothing is published, "matching" under a filter', () => {
  assert.match(page(), /No tracks are available yet/);
  harness.reset();
  harness.url = new URLSearchParams('track_type=clinical');
  assert.match(page(), /No tracks found matching your criteria/);
});

test('the empty state is shown by the section itself', () => {
  const html = render(require('react').createElement(CatalogSection, { title: 'All Tracks', programs: [], emptyMessage: 'Nothing here', onOpen() {} }));
  assert.match(html, /All Tracks/);
  assert.match(html, /Nothing here/);
});

// --- Recommended hidden when empty --------------------------------------------------------------

test('Recommended Tracks for You is hidden entirely when it is empty, shown when it has programs', () => {
  harness.catalog = () => catalogResponse([program(1)]);
  assert.match(page(), /Recommended Tracks for You/); // the stub answers both requests with a program
  harness.reset();
  harness.catalog = params => (params.recommended ? catalogResponse([]) : catalogResponse([program(1)]));
  const html = page();
  assert.doesNotMatch(html, /Recommended Tracks for You/);
  assert.doesNotMatch(html, /Expand your skill set/);
  assert.match(html, /All Tracks/);
});

test('Recommended and All Tracks may both show a program, but never twice within one section', () => {
  harness.catalog = () => catalogResponse([program(7, { title: 'Dup Track' }), program(7, { title: 'Dup Track' })]);
  const html = page();
  assert.equal((html.match(/Dup Track<\/h4>/g) || []).length, 2); // once in Recommended, once in All Tracks
});

// --- My Active Tracks ------------------------------------------------------------------------

test('signed out: no My Active Tracks section and the enrolled endpoint is not called', () => {
  harness.user = {};
  harness.enrolled = () => enrolledResponse([program(1, { enroll_status: 'InProgress', progress: 40 })]);
  const html = page();
  assert.doesNotMatch(html, /My Active Tracks/);
  assert.equal(harness.enrolledCalls.length, 0);
});

test('signed in with no track in progress: the section is hidden', () => {
  harness.enrolled = () => enrolledResponse([program(1, { enroll_status: 'Complete', progress: 100 })]);
  assert.doesNotMatch(page(), /My Active Tracks/);
});

test('signed in with a track in progress: heading, sub-text, progress bar and Continue Track', () => {
  harness.enrolled = () => enrolledResponse([program(5, { title: 'Half Done', enroll_status: 'InProgress', progress: 40 })]);
  const html = page();
  assert.match(html, /My Active Tracks/);
  assert.match(html, /Resume your learning and track your progress toward certification\./);
  assert.match(html, /role="progressbar"[^>]*aria-valuenow="40"/);
  assert.match(html, /40% complete/);
  assert.match(html, /Continue Track/);
  assert.deepEqual(harness.enrolledCalls, [{ status: 'InProgress' }]);
});

test('under a track pill, My Active Tracks filters enrolled cards by their own track_type', () => {
  harness.url = new URLSearchParams('track_type=clinical');
  harness.catalog = () => catalogResponse([]); // the filtered catalog returns none of them: must not matter
  harness.enrolled = () => enrolledResponse([
    program(1, { title: 'Is Clinical', track_type: 'clinical', enroll_status: 'InProgress', progress: 10 }),
    program(2, { title: 'Is Foundational', track_type: 'foundational', enroll_status: 'InProgress', progress: 10 }),
    program(3, { title: 'No Track', track_type: null, enroll_status: 'InProgress', progress: 10 }),
  ]);
  const section = page().split('>My Active Tracks</h2>')[1].split('>All Tracks</h2>')[0];
  assert.match(section, /Is Clinical/);
  assert.doesNotMatch(section, /Is Foundational/);
  assert.doesNotMatch(section, /No Track/);
});

test('a no-longer-published program still shows under its pill (it is not in the catalog)', () => {
  harness.url = new URLSearchParams('track_type=coaching_practice');
  harness.catalog = () => catalogResponse([]);
  harness.enrolled = () => enrolledResponse([program(9, { title: 'Retired But Mine', track_type: 'coaching_practice', enroll_status: 'InProgress', progress: 55 })]);
  assert.match(page(), /Retired But Mine/);
});

test('All Tracks pill keeps every in-progress enrollment, whatever its track_type', () => {
  const enrolled = [
    program(1, { track_type: 'clinical', enroll_status: 'InProgress' }),
    program(2, { track_type: null, enroll_status: 'InProgress' }),
    program(3, { track_type: 'foundational', enroll_status: 'Complete' }),
  ];
  assert.deepEqual(model.selectActiveTracks(enrolled, { trackType: '' }).map(p => p.id), [1, 2]);
  assert.deepEqual(model.selectActiveTracks(enrolled, { trackType: 'clinical' }).map(p => p.id), [1]);
});

// --- card text ---------------------------------------------------------------------------------

test('modules and lessons: singular for 1, plural otherwise, "•" between', () => {
  assert.equal(model.metaLabel({ module_count: 1, lesson_count: 1 }), '1 Module • 1 Lesson');
  assert.equal(model.metaLabel({ module_count: 3, lesson_count: 12 }), '3 Modules • 12 Lessons');
  assert.equal(model.metaLabel({}), '0 Modules • 0 Lessons');
  assert.match(render(require('react').createElement(ProgramCard, { program: program(1, { module_count: 1, lesson_count: 1 }), onClick() {} })), /1 Module • 1 Lesson/);
  assert.match(render(require('react').createElement(ProgramCard, { program: program(1, { module_count: 2, lesson_count: 5 }), onClick() {} })), /2 Modules • 5 Lessons/);
});

test('price: "USD 500 one-time", decimals kept, "Free"', () => {
  assert.equal(model.priceLabel({ price: '500.00', currency: 'USD', payment_type: 'one_time' }), 'USD 500 one-time');
  assert.equal(model.priceLabel({ price: '49.50', currency: 'EUR', payment_type: 'one_time' }), 'EUR 49.50 one-time');
  assert.equal(model.priceLabel({ price: '0', currency: 'USD', payment_type: 'free' }), 'Free');
});

test('Start Track for an unstarted program, Continue Track once in progress', () => {
  const el = p => render(require('react').createElement(ProgramCard, { program: p, onClick() {} }));
  const fresh = el(program(1));
  assert.match(fresh, /Start Track/);
  assert.doesNotMatch(fresh, /Continue Track/);
  const started = el(program(1, { is_enrolled: true, enroll_status: 'InProgress', progress: 20 }));
  assert.match(started, /Continue Track/);
  assert.doesNotMatch(started, /Start Track/);
  assert.ok(fresh.includes('min-h-[44px]') && started.includes('min-h-[44px]'));
});

test('track badge per type, with "Professional Track" as the fallback', () => {
  const badge = trackType => render(require('react').createElement(ProgramCard, { program: program(1, { track_type: trackType }), onClick() {} }));
  assert.match(badge('clinical'), /Clinical Track</);
  assert.match(badge('coaching_practice'), /Coaching &amp; Practice Track</);
  assert.match(badge('foundational'), /Foundational Track</);
  assert.match(badge(null), /Professional Track</);
  assert.match(badge(undefined), /Professional Track</);
});

test('the description is shown, clamped to two lines, between the title and the meta line', () => {
  const html = card({ short_description: 'Learn the basics.', modules: [{ title: 'SECRET MODULE' }] });
  assert.match(html, /<p class="[^"]*line-clamp-2[^"]*">Learn the basics\.<\/p>/);
  assert.ok(html.indexOf('Track 1</h4>') < html.indexOf('Learn the basics.'));
  assert.ok(html.indexOf('Learn the basics.') < html.indexOf('3 Modules'));
  assert.doesNotMatch(html, /SECRET MODULE/); // no lesson/module content on a card
});

test('the description line is hidden when empty, missing or only markup', () => {
  for (const value of [undefined, null, '', '   ', '<p></p>', '<br/>']) {
    assert.doesNotMatch(card({ short_description: value }), /<p class="[^"]*line-clamp-2/, JSON.stringify(value)); // the title <h4> also clamps
  }
});

test('a description containing tags renders as plain text, never as HTML', () => {
  const html = card({ short_description: '<p onclick="x()">Hello <b>big</b> world</p><script>alert(1)</script><img src=x onerror=y>' });
  assert.match(html, />Hello big world</);
  for (const forbidden of ['<script', '<b>', 'src="x"', 'onclick', 'onerror', 'alert(1)']) assert.ok(!html.includes(forbidden), forbidden);
  // entities are decoded to characters and then escaped by React, so they cannot become tags
  const escaped = card({ short_description: 'Tom &amp; Jerry &lt;b&gt;' });
  assert.match(escaped, /Tom &amp; Jerry &lt;b&gt;/);
  assert.ok(!escaped.includes('<b>'));
});

test('plainText: nested/odd markup cannot reassemble a tag, non-strings give an empty string', () => {
  assert.equal(model.plainText('<<b>script>alert(1)<</b>/script>'), 'script>alert(1) /script>');
  assert.equal(model.plainText('a <style>p{}</style>b'), 'a b');
  assert.equal(model.plainText(null), '');
  assert.equal(model.plainText(42), '');
});

test('My Active Tracks badge comes from the enrolled card track_type, fallback only when null', () => {
  harness.enrolled = () => enrolledResponse([
    program(1, { title: 'Clin', track_type: 'clinical', enroll_status: 'InProgress', progress: 5 }),
    program(2, { title: 'Untyped', track_type: null, enroll_status: 'InProgress', progress: 5 }),
  ]);
  const section = page().split('>My Active Tracks</h2>')[1].split('>All Tracks</h2>')[0];
  const [clin, untyped] = [section.split('Untyped')[0], section.split('Untyped')[1]];
  assert.match(clin, /Clinical Track</);
  assert.doesNotMatch(clin, /Professional Track</);
  assert.match(untyped, /Professional Track</);
});

test('header copy', () => {
  const html = page();
  assert.match(html, /Professional Tracks/);
  assert.match(html, /Explore accredited learning tracks, elevate your practice, and earn recognized credentials in specialized health and wellness\./);
});

// --- model details -----------------------------------------------------------------------------

test('buildCatalogParams: no track_type for All, recommended only when asked, tag kept', () => {
  assert.deepEqual(model.buildCatalogParams({}), { tags: [] });
  assert.deepEqual(model.buildCatalogParams({ trackType: 'clinical', recommended: true, tag: 'yoga' }), { tags: ['yoga'], track_type: 'clinical', recommended: 'true' });
  assert.equal(model.parseTrackType('clinical'), 'clinical');
  assert.equal(model.parseTrackType(''), '');
  assert.equal(model.parseTrackType(null), '');
});
