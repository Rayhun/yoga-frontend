// Program Builder: three UI steps (1 Basics · 2 Content · 3 Publish). Covers the stepper markup, the old/new URL →
// step mapping (see the table in builderUrlState.js), and that the Publish checklist's "Fix" targets land on the
// exact Basics part / Content tab / module / lesson. Logic and server-rendered markup only — not looked at in a browser.
//
//   node -r sucrase/register -r ./src/components/certification/learner/__tests__/harness.cjs \
//        --test src/components/certification/builder/__tests__/
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
require('../../learner/__tests__/harness.cjs');

const url = require('../builderUrlState');
const { getPublishBlockers, getPublishRecommendations } = require('../publish/readiness');
const BuilderStepper = require('../BuilderStepper').default;
const PublishChecklist = require('../publish/PublishChecklist').default;

const READY = {
  title: 'T', delivery_format: 'online', payment_type: 'one_time', price: '10.00', stripe_product_id: 'prod_1',
  modules: [{ id: 5, lessons: [{ id: 9, lesson_type: 'text', text_content: '<p>x</p>' }] }],
  certificate_setting: { certificate_title: 'C', primary_issuer_name: 'I' },
};
const program = overrides => ({ ...READY, ...overrides });
const paramsOf = query => new URLSearchParams(query);
const resolve = query => url.resolvePosition(url.parseBuilderUrl(paramsOf(query)), { hasProgram: true, resume: null });
const failing = (overrides, id) => getPublishBlockers(program(overrides)).find(check => check.id === id && !check.ok);

const STEPS = [
  { id: 1, label: 'Basics', panelId: 'builder-step-basics' },
  { id: 2, label: 'Content', panelId: 'builder-step-content' },
  { id: 3, label: 'Publish', panelId: 'builder-step-publish' },
];
const renderStepper = (currentStep, steps = STEPS) =>
  renderToStaticMarkup(React.createElement(BuilderStepper, { steps, currentStep, onSelect: () => {} }));

// --- stepper ------------------------------------------------------------------------------------------------

test('the stepper renders three steps labelled Basics, Content and Publish', () => {
  const html = renderStepper(1);
  assert.equal((html.match(/role="tab"/g) || []).length, 3);
  ['Basics', 'Content', 'Publish'].forEach(label => assert.ok(html.includes(label), label));
  assert.ok(html.includes('Step 3 of 3'), 'screen-reader text follows the step count');
  assert.ok(!html.includes('Content &amp; Publish') && !html.includes('Content & Publish'), 'the old combined label is gone');
});

test('the stepper marks the current step, wires each tab to its panel, and shows done marks', () => {
  const html = renderStepper(2, STEPS.map(step => (step.id === 1 ? { ...step, done: true } : step)));
  assert.equal((html.match(/aria-selected="true"/g) || []).length, 1);
  assert.match(html, /id="builder-step-content-tab"[^>]*aria-selected="true"|aria-selected="true"[^>]*id="builder-step-content-tab"/);
  ['builder-step-basics', 'builder-step-content', 'builder-step-publish'].forEach(id => assert.ok(html.includes(`aria-controls="${id}"`), id));
  assert.ok(html.includes('<svg'), 'a done step that is not current shows the check icon');
});

test('Content and Publish stay disabled until the draft exists', () => {
  const html = renderStepper(1, STEPS.map(step => (step.id === 1 ? step : { ...step, disabled: true, disabledReason: 'Give the program a title first' })));
  assert.equal((html.match(/disabled=""/g) || []).length, 2);
  assert.ok(html.includes('Give the program a title first'));
});

// --- old and new URLs → UI step -----------------------------------------------------------------------------

test('uiStepOf: Basics → 1, curriculum / pricing / certificate → 2 (Content), publish → 3, unknown → 1', () => {
  assert.equal(url.uiStepOf('basics'), 1);
  ['curriculum', 'pricing', 'certificate'].forEach(step => assert.equal(url.uiStepOf(step), 2, step));
  assert.equal(url.uiStepOf('publish'), 3);
  [undefined, null, '', 'bogus'].forEach(step => assert.equal(url.uiStepOf(step), 1, String(step)));
});

test('Content tabs do not include publish, and every URL step maps to exactly one UI step', () => {
  assert.deepEqual(url.CONTENT_STEPS, ['curriculum', 'pricing', 'certificate']);
  assert.deepEqual(url.BUILDER_STEPS.map(url.uiStepOf), [1, 2, 2, 2, 3]);
});

test('old two-step links still open the right new step', () => {
  // content folds and lesson / module deep links → Content
  const cases = [
    ['step=curriculum', 'curriculum', 2],
    ['step=curriculum&lesson=17', 'curriculum', 2],
    ['step=curriculum&module=3', 'curriculum', 2],
    ['lesson=17', 'curriculum', 2], // an item with no step still means the curriculum
    ['step=pricing', 'pricing', 2],
    ['step=certificate', 'certificate', 2],
    // any publish / status deep link → Publish
    ['step=publish', 'publish', 3],
    // Basics is unchanged, with its parts
    ['step=basics&fold=catalog', 'basics', 1],
  ];
  cases.forEach(([query, step, ui]) => {
    const position = resolve(query);
    assert.equal(position.step, step, query);
    assert.equal(url.uiStepOf(position.step), ui, query);
  });
  assert.deepEqual(resolve('step=curriculum&lesson=17').item, { type: 'lesson', id: 17 });
  assert.equal(resolve('step=basics&fold=catalog').fold, 'catalog');
});

test('new links round-trip: positionToQuery keeps the same query params as before the split', () => {
  assert.equal(url.positionToQuery({ step: 'publish', fold: null, item: null }), 'step=publish');
  assert.equal(url.positionToQuery({ step: 'pricing', fold: null, item: null }), 'step=pricing');
  assert.equal(url.positionToQuery({ step: 'curriculum', fold: null, item: { type: 'lesson', id: 4 } }), 'step=curriculum&lesson=4');
  assert.equal(url.positionToQuery({ step: 'basics', fold: 'format', item: null }), 'step=basics&fold=format');
});

// --- readiness links ----------------------------------------------------------------------------------------

test('each failing readiness check links to the Basics part or Content tab that fixes it', () => {
  const targetOf = (overrides, id) => failing(overrides, id).target;
  assert.deepEqual(targetOf({ title: '' }, 'basics'), { step: 'basics', fold: 'about', item: null });
  assert.deepEqual(targetOf({ delivery_format: null }, 'delivery'), { step: 'basics', fold: 'format', item: null });
  assert.deepEqual(targetOf({ modules: [] }, 'curriculum'), { step: 'curriculum', fold: null, item: null });
  assert.deepEqual(targetOf({ price: '' }, 'pricing'), { step: 'pricing', fold: null, item: null });
  assert.deepEqual(targetOf({ certificate_setting: null }, 'certificate_setup'), { step: 'certificate', fold: null, item: null });
});

test('an empty module links to that exact module; a lesson gap links to that exact lesson', () => {
  const emptyModule = failing({ modules: [{ id: 5, lessons: [{ id: 9 }] }, { id: 6, lessons: [] }] }, 'curriculum');
  assert.deepEqual(emptyModule.target, { step: 'curriculum', fold: null, item: { type: 'module', id: 6 } });
  assert.equal(url.positionToQuery(emptyModule.target), 'step=curriculum&module=6');

  const gaps = getPublishRecommendations(program({ modules: [{ id: 5, title: 'M', lessons: [{ id: 9, title: 'L', lesson_type: 'video', content_url: '' }] }] }));
  assert.equal(gaps.length, 1);
  assert.deepEqual(gaps[0].target, { step: 'curriculum', fold: null, item: { type: 'lesson', id: 9 } });
  assert.equal(url.positionToQuery(gaps[0].target), 'step=curriculum&lesson=9');
});

test('every readiness target is a position the URL layer reads back unchanged, and maps to Basics or Content (never Publish)', () => {
  const broken = program({ title: '', delivery_format: null, modules: [{ id: 6, lessons: [] }], price: '', certificate_setting: null });
  getPublishBlockers(broken).filter(check => !check.ok).forEach(check => {
    const position = url.resolvePosition(url.parseBuilderUrl(paramsOf(url.positionToQuery(check.target))), { hasProgram: true, resume: null });
    assert.deepEqual(position, check.target, check.id);
    assert.ok([1, 2].includes(url.uiStepOf(check.target.step)), `${check.id} must send the creator back to Basics or Content`);
  });
});

test('the resume point is the first failing check target, or Publish when everything is ready', () => {
  assert.deepEqual(url.getResumePosition(program({ delivery_format: null })), { step: 'basics', fold: 'format', item: null });
  assert.deepEqual(url.getResumePosition(program({})), { step: 'publish', fold: null, item: null });
});

// --- the Publish checklist ----------------------------------------------------------------------------------

const renderChecklist = (blockers, recommendations = []) =>
  renderToStaticMarkup(React.createElement(PublishChecklist, { blockers, recommendations, onGoTo: () => {} }));

test('the checklist offers a Fix button only for items that need work', () => {
  const html = renderChecklist(getPublishBlockers(program({ delivery_format: null, price: '' })));
  assert.ok(html.includes('Fix Delivery format'));
  assert.ok(html.includes('Fix Pricing'));
  assert.ok(!html.includes('Fix Basics') && !html.includes('Fix Curriculum') && !html.includes('Fix Certificate'));
  assert.ok(html.includes('2 required items need attention'));
});

test('a complete program shows no Fix buttons', () => {
  const html = renderChecklist(getPublishBlockers(program({})));
  assert.ok(!html.includes('Fix '));
  assert.ok(html.includes('Everything required is complete.'));
});

test('the Fix buttons call onGoTo with the check target (the exact fold / lesson)', () => {
  const calls = [];
  const blockers = getPublishBlockers(program({ delivery_format: null, modules: [{ id: 6, lessons: [] }] }));
  const recommendations = getPublishRecommendations(program({ modules: [{ id: 5, title: 'M', lessons: [{ id: 9, title: 'L', lesson_type: 'link', content_url: '' }] }] }));
  const tree = PublishChecklist({ blockers, recommendations, onGoTo: target => calls.push(target) });
  // walk the element tree for FixButton elements and fire their handlers
  const buttons = [];
  const walk = node => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (node.props && typeof node.props.onClick === 'function' && typeof node.props.label === 'string') buttons.push(node.props);
    if (node.props) walk(node.props.children);
  };
  walk(tree);
  buttons.forEach(button => button.onClick());
  assert.deepEqual(calls.map(call => `${call.step}:${call.fold ?? ''}:${call.item ? `${call.item.type}-${call.item.id}` : ''}`), [
    'basics:format:',
    'curriculum::module-6',
    'curriculum::lesson-9',
  ]);
});
