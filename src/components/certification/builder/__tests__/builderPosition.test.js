// Tests for the Program Builder's URL state (step / Basics part / curriculum item), the resume point, the
// /new -> id transition (with a fake router), and a repo check that the code deleted in the cleanup is gone.
// Logic and server-rendered markup only: nothing here was looked at in a browser.
//
//   node -r sucrase/register -r ./src/components/certification/learner/__tests__/harness.cjs \
//        --test src/components/certification/builder/__tests__/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const harness = require('../../learner/__tests__/harness.cjs');

const url = require('../builderUrlState');
const useBuilderPosition = require('../useBuilderPosition').default;

const TEACHER_BASE = '/portal/teacher/certification/programs/builder';
const paramsOf = query => new URLSearchParams(query);
const resolve = (query, { hasProgram = true, resume = null } = {}) =>
  url.resolvePosition(url.parseBuilderUrl(paramsOf(query)), { hasProgram, resume });

// A program that is complete except for what a test overrides.
const READY = {
  title: 'T', delivery_format: 'online', payment_type: 'one_time', price: '10.00', stripe_product_id: 'prod_1',
  modules: [{ id: 5, lessons: [{ id: 9 }] }], certificate_setting: { certificate_title: 'C', primary_issuer_name: 'I' },
};
const program = overrides => ({ ...READY, ...overrides });

// --- URL round trip ----------------------------------------------------------------------------------------

test('every step round-trips through the URL', () => {
  url.BUILDER_STEPS.forEach(step => {
    const position = { step, fold: step === 'basics' ? 'about' : null, item: null };
    assert.deepEqual(resolve(url.positionToQuery(position)), position, step);
  });
});

test('every Basics part round-trips, and the fold is only written for Basics', () => {
  url.BASICS_FOLD_IDS.forEach(fold => {
    const position = { step: 'basics', fold, item: null };
    assert.equal(url.positionToQuery(position), `step=basics&fold=${fold}`);
    assert.deepEqual(resolve(url.positionToQuery(position)), position);
  });
  assert.equal(url.positionToQuery({ step: 'pricing', fold: 'catalog', item: null }), 'step=pricing');
});

test('a selected lesson or module round-trips on the curriculum step', () => {
  const lesson = { step: 'curriculum', fold: null, item: { type: 'lesson', id: 17 } };
  assert.equal(url.positionToQuery(lesson), 'step=curriculum&lesson=17');
  assert.deepEqual(resolve('step=curriculum&lesson=17'), lesson);
  const mod = { step: 'curriculum', fold: null, item: { type: 'module', id: 3 } };
  assert.deepEqual(resolve(url.positionToQuery(mod)), mod);
  assert.deepEqual(resolve('lesson=17'), lesson, 'a link naming only an item means the curriculum');
  assert.equal(resolve('step=pricing&lesson=17').item, null, 'an item only applies to the curriculum');
});

test('curriculum keys convert to URL items and back; anything else is not an item', () => {
  assert.deepEqual(url.itemFromKey('lesson-7'), { type: 'lesson', id: 7 });
  assert.equal(url.itemToKey(url.itemFromKey('module-12')), 'module-12');
  ['lesson-abc', 'question-4', 'lesson-', '', null, undefined].forEach(key => assert.equal(url.itemFromKey(key), null, String(key)));
});

test('the builder base path works for the teacher and the institution portals, new or saved', () => {
  assert.equal(url.getBuilderBasePath(`${TEACHER_BASE}/new`), TEACHER_BASE);
  assert.equal(url.getBuilderBasePath(`${TEACHER_BASE}/42/`), TEACHER_BASE);
  assert.equal(url.getBuilderBasePath('/portal/institution/certification/programs/builder/new'), '/portal/institution/certification/programs/builder');
});

// --- stale / unknown values ----------------------------------------------------------------------------------

test('unknown or stale values fall back safely and never throw', () => {
  // existing program: no usable step -> the resume point; fold falls back to the first part
  const resume = { step: 'pricing', fold: null, item: null };
  ['step=bogus', 'step=', 'step=%00', 'fold=nope', 'lesson=abc', 'lesson=-1', 'lesson=1.5', 'module=', ''].forEach(query => {
    assert.doesNotThrow(() => resolve(query, { resume }), query);
  });
  assert.deepEqual(resolve('step=bogus', { resume }), resume);
  assert.deepEqual(resolve('', { resume }), resume);
  assert.equal(resolve('step=basics&fold=nope').fold, 'about');
  assert.equal(resolve('step=curriculum&lesson=abc').item, null);
  // nothing at all
  assert.doesNotThrow(() => url.parseBuilderUrl(null));
  assert.doesNotThrow(() => url.parseBuilderUrl(undefined));
  assert.deepEqual(url.parseBuilderUrl(null), { step: null, fold: null, item: null });
});

test('a brand-new program only has Basics: any other step in the URL starts at the beginning', () => {
  ['step=pricing', 'step=publish', 'step=curriculum&lesson=3', ''].forEach(query =>
    assert.deepEqual(resolve(query, { hasProgram: false }), { step: 'basics', fold: 'about', item: null }, query));
  assert.equal(resolve('step=basics&fold=media', { hasProgram: false }).fold, 'media'); // a part of Basics is fine
});

// --- resume at the first incomplete check -------------------------------------------------------------------

test('resume picks the first incomplete readiness check', () => {
  const cases = [
    ['no title', program({ title: '' }), { step: 'basics', fold: 'about', item: null }],
    ['no delivery format', program({ delivery_format: null }), { step: 'basics', fold: 'format', item: null }],
    ['no modules', program({ modules: [] }), { step: 'curriculum', fold: null, item: null }],
    ['a module without lessons', program({ modules: [{ id: 5, lessons: [{ id: 9 }] }, { id: 6, lessons: [] }] }),
      { step: 'curriculum', fold: null, item: { type: 'module', id: 6 } }],
    ['no price', program({ price: '' }), { step: 'pricing', fold: null, item: null }],
    ['no Stripe product', program({ stripe_product_id: '' }), { step: 'pricing', fold: null, item: null }],
    ['no certificate title', program({ certificate_setting: { primary_issuer_name: 'I' } }), { step: 'certificate', fold: null, item: null }],
    ['everything ready', program({}), { step: 'publish', fold: null, item: null }],
  ];
  cases.forEach(([name, input, expected]) => assert.deepEqual(url.getResumePosition(input), expected, name));
});

test('resume follows check order: an earlier gap wins over a later one', () => {
  assert.equal(url.getResumePosition(program({ modules: [], price: '', certificate_setting: null })).step, 'curriculum');
  assert.equal(url.getResumePosition(program({ delivery_format: null, modules: [] })).fold, 'format');
  assert.equal(url.getResumePosition(program({ price: '', certificate_setting: null })).step, 'pricing');
});

test('resume only applies without a step in the URL; an explicit step always wins', () => {
  const resume = url.getResumePosition(program({ modules: [] }));
  assert.equal(resolve('', { resume }).step, 'curriculum');
  assert.equal(resolve('step=pricing', { resume }).step, 'pricing');
  assert.deepEqual(resolve('step=basics&fold=catalog', { resume }), { step: 'basics', fold: 'catalog', item: null });
});

test('a payment-type "free" program is not asked for a price (pricing ok)', () => {
  assert.equal(url.getResumePosition(program({ payment_type: 'free', price: '', stripe_product_id: '' })).step, 'publish');
});

// --- /new -> id with a fake router ---------------------------------------------------------------------------

const fakeRouter = start => {
  const history = [start];
  return {
    get url() { return history[history.length - 1]; },
    history,
    push: target => history.push(target),
    replace: target => { history[history.length - 1] = target; },
    back: () => history.pop(),
  };
};
const searchOf = href => new URL(href, 'http://x.test').searchParams;

test('creating the draft swaps /new for the id and keeps the step and Basics part', () => {
  const router = fakeRouter(`${TEACHER_BASE}/new?step=basics&fold=catalog`);
  const position = resolve('step=basics&fold=catalog', { hasProgram: false });
  url.replaceUrlAfterCreate({ router, basePath: url.getBuilderBasePath(`${TEACHER_BASE}/new`), programId: 42, position });

  assert.equal(router.url, `${TEACHER_BASE}/42?step=basics&fold=catalog`);
  assert.equal(router.history.length, 1, 'replace, not push: Back must not return to the dead /new');
  // the builder remounts on the real id: it reads the same place back, and does NOT jump to the resume point
  const afterRemount = url.resolvePosition(url.parseBuilderUrl(searchOf(router.url)), { hasProgram: true, resume: url.getResumePosition(program({ modules: [] })) });
  assert.deepEqual(afterRemount, { step: 'basics', fold: 'catalog', item: null });
});

test('creating the draft with no params in the URL writes the beginning explicitly (so resume cannot hijack it)', () => {
  const router = fakeRouter(`${TEACHER_BASE}/new`);
  const position = resolve('', { hasProgram: false });
  url.replaceUrlAfterCreate({ router, basePath: TEACHER_BASE, programId: 7, position });
  assert.equal(router.url, `${TEACHER_BASE}/7?step=basics&fold=about`);
});

test('the institution portal prefix survives the swap', () => {
  const base = '/portal/institution/certification/programs/builder';
  const router = fakeRouter(`${base}/new?step=basics&fold=media`);
  url.replaceUrlAfterCreate({ router, basePath: url.getBuilderBasePath(`${base}/new`), programId: 9, position: resolve('step=basics&fold=media', { hasProgram: false }) });
  assert.equal(router.url, `${base}/9?step=basics&fold=media`);
});

test('a move made right after the draft is created targets the new id, never /new', () => {
  const router = fakeRouter(`${TEACHER_BASE}/new?step=basics&fold=about`);
  url.replaceUrlAfterCreate({ router, basePath: TEACHER_BASE, programId: 42, position: resolve('', { hasProgram: false }) });
  // the next fold, built with the adopted id (what useBuilderPosition's ref provides)
  router.push(url.builderUrl({ basePath: TEACHER_BASE, programId: 42, position: { step: 'basics', fold: 'catalog', item: null } }));
  assert.equal(router.url, `${TEACHER_BASE}/42?step=basics&fold=catalog`);
  assert.ok(!router.history.some(entry => entry.includes('/new')), 'no /new entry may remain');
});

test('back / forward walk the steps; each entry restores its own step and part', () => {
  const router = fakeRouter(`${TEACHER_BASE}/42?step=basics&fold=about`);
  const go = position => router.push(url.builderUrl({ basePath: TEACHER_BASE, programId: 42, position }));
  go({ step: 'basics', fold: 'catalog', item: null });
  go({ step: 'curriculum', fold: null, item: null });
  go({ step: 'pricing', fold: null, item: null });
  const at = () => resolve(searchOf(router.url).toString());
  assert.equal(at().step, 'pricing');
  router.back();
  assert.equal(at().step, 'curriculum');
  router.back();
  assert.deepEqual(at(), { step: 'basics', fold: 'catalog', item: null });
  router.back();
  assert.equal(at().fold, 'about');
});

// --- the hook, rendered with the stub router ------------------------------------------------------------------

const Probe = ({ liveId, program: current }) => {
  const { position } = useBuilderPosition({ liveId, program: current });
  return React.createElement('span', null, JSON.stringify(position));
};
const probe = ({ query = '', pathname, liveId, program: current }) => {
  harness.reset();
  harness.url = new URLSearchParams(query);
  harness.pathname = pathname;
  return JSON.parse(/>(.*)<\/span>/.exec(renderToStaticMarkup(React.createElement(Probe, { liveId, program: current })))[1].replace(/&quot;/g, '"'));
};

test('the hook reads the URL; with no step it resumes at the first incomplete check; a new program starts at Basics', () => {
  assert.deepEqual(probe({ query: 'step=pricing', pathname: `${TEACHER_BASE}/42`, liveId: '42', program: program({}) }), { step: 'pricing', fold: null, item: null });
  assert.equal(probe({ pathname: `${TEACHER_BASE}/42`, liveId: '42', program: program({ modules: [] }) }).step, 'curriculum');
  assert.equal(probe({ query: 'step=pricing', pathname: `${TEACHER_BASE}/new`, liveId: null, program: undefined }).step, 'basics');
  assert.deepEqual(probe({ pathname: `${TEACHER_BASE}/new`, liveId: null }), { step: 'basics', fold: 'about', item: null });
});

test('the hook keeps the lesson from a shared link, and ignores a stale step', () => {
  assert.deepEqual(probe({ query: 'step=curriculum&lesson=17', pathname: `${TEACHER_BASE}/42`, liveId: '42', program: program({}) }),
    { step: 'curriculum', fold: null, item: { type: 'lesson', id: 17 } });
  assert.equal(probe({ query: 'step=zzz', pathname: `${TEACHER_BASE}/42`, liveId: '42', program: program({ price: '' }) }).step, 'pricing');
});

test('the Basics part ids match the real Basics parts, in order', () => {
  const { BASICS_FOLDS } = require('../sections/basicsFolds');
  assert.deepEqual(url.BASICS_FOLD_IDS, BASICS_FOLDS.map(fold => fold.id));
});

// --- cleanup: nothing imports what was deleted ---------------------------------------------------------------

const SRC = path.resolve(__dirname, '../../../..');
const sourceFiles = () => {
  const out = [];
  (function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(jsx?|cjs)$/.test(entry.name)) out.push(full);
    });
  })(SRC);
  return out;
};

test('the removed leftovers (findFirstUnsavableKey, blankModule, getLessonProblem) are referenced nowhere', () => {
  const dead = ['findFirstUnsavableKey', 'blankModule', 'getLessonProblem'];
  const offenders = sourceFiles()
    .filter(file => file !== __filename)
    .filter(file => dead.some(name => new RegExp(`\\b${name}\\b`).test(fs.readFileSync(file, 'utf8'))));
  assert.deepEqual(offenders, []);
});

test('every "@/" and relative import under the Certification components resolves to a file', () => {
  const missing = [];
  const resolveFile = base => ['', '.js', '.jsx', '.cjs', '/index.js', '/index.jsx'].some(ext => fs.existsSync(base + ext) && fs.statSync(base + ext).isFile());
  sourceFiles()
    .filter(file => file.includes(`${path.sep}components${path.sep}certification${path.sep}`) && !file.endsWith('harness.cjs'))
    .forEach(file => {
      const code = fs.readFileSync(file, 'utf8');
      [...code.matchAll(/(?:from|require\()\s*['"]((?:@\/|\.\.?\/)[^'"]+)['"]/g)].forEach(([, spec]) => {
        const target = spec.startsWith('@/') ? path.join(SRC, spec.slice(2)) : path.resolve(path.dirname(file), spec);
        if (!resolveFile(target)) missing.push(`${path.relative(SRC, file)} -> ${spec}`);
      });
    });
  assert.deepEqual(missing, []);
});
