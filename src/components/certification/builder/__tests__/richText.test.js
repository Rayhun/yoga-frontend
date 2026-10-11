// Tests for the certification rich text editor wiring (lesson text / assignment instructions / module description).
// There is no DOM in this runner, so Quill itself and DOMPurify's real sanitizing are NOT exercised: the editor is
// stubbed to capture its props, DOMPurify is stubbed to record how it is called, and the autosave hook is run on a
// tiny fake hook runtime. NOTHING here checks appearance or real typing.
//
//   node -r sucrase/register -r ./src/components/certification/learner/__tests__/harness.cjs \
//        --test src/components/certification/builder/__tests__/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const harness = require('../../learner/__tests__/harness.cjs');
const realFormik = require('formik');

// --- scoped module stubs (only for the file named in each rule) -----------------------------------------------
const stub = { fakeField: null, setValues: [], touched: [], purify: null, react: null };
const realLoad = Module._load;
Module._load = function (request, parent, ...rest) {
  const from = (parent && parent.filename) || '';
  if (request === 'formik' && from.endsWith('FormikRichTextEditor.jsx')) {
    return {
      ...realFormik,
      useField: name =>
        stub.fakeField
          ? [{ name, value: stub.fakeField.value }, {}, { setValue: value => stub.setValues.push(value), setTouched: value => stub.touched.push(value) }]
          : realFormik.useField(name),
    };
  }
  if (request === 'dompurify' && from.endsWith('richTextSafety.js')) return stub.purify;
  if (request === 'react' && from.endsWith('useSectionAutosave.js')) return stub.react;
  return realLoad.call(this, request, parent, ...rest);
};

const richText = require('../richText');
const { toLessonFieldsPayload, toModuleFieldsPayload } = require('../sections/curriculumFields');
const { getPublishRecommendations } = require('../publish/readiness');
const CertificationRichTextField = require('../CertificationRichTextField').default;
const LessonContentFields = require('../curriculum/LessonContentFields').default;
const safety = require('@/utils/richTextSafety');
const TextLesson = require('../../session/lessons/TextLesson').default;

const SRC = path.resolve(__dirname, '../../../..');
const freshRequire = relative => {
  const file = require.resolve(path.join(SRC, relative)); // require.resolve does not know the "@/" alias
  delete require.cache[file];
  return require(file);
};
const render = element => renderToStaticMarkup(element);
const lessonOf = overrides => ({ lesson_type: 'text', title: 'L', text_content: '', content_url: '', duration_minutes: '', ...overrides });

test.beforeEach(() => {
  harness.reset();
  harness.quillProps = null;
  stub.fakeField = null;
  stub.setValues = [];
  stub.touched = [];
});

// --- round trip: no double escaping ------------------------------------------------------------------------------

// What the editor is shown for a stored value, and what the form stores for what the editor emits.
const toEditor = richText.plainTextToHtml;
const fromEditor = richText.editorHtmlToValue;

test('text typed with an ampersand never comes back as "&amp;amp;" or shows a literal "&amp;"', () => {
  // old plain textarea: "a & b" was stored raw; the backend's sanitizer then returned "a &amp; b" as text
  assert.equal(toEditor('a & b'), '<p>a &amp; b</p>');
  assert.equal(toEditor('a &amp; b'), '<p>a &amp; b</p>'); // already-escaped legacy text is not escaped twice
  // the editor emits HTML for what is typed; the form stores it as is
  assert.equal(fromEditor('<p>a &amp; b</p>'), '<p>a &amp; b</p>');
  assert.equal(toEditor('<p>a &amp; b</p>'), '<p>a &amp; b</p>'); // HTML passes through untouched
});

test('value -> editor -> value is stable however many times it is loaded and saved', () => {
  for (const stored of ['a & b', 'a &amp; b', '<p>a &amp; b</p>', 'x < y & z > w', '<p>5 &lt; 6</p>', 'Tom &amp; Jerry &copy; 2025']) {
    const once = fromEditor(toEditor(stored));
    const twice = fromEditor(toEditor(once));
    const thrice = fromEditor(toEditor(twice));
    assert.equal(twice, once, stored);
    assert.equal(thrice, once, stored);
    assert.ok(!once.includes('&amp;amp;'), stored);
  }
  assert.equal(toEditor('x < y & z > w'), '<p>x &lt; y &amp; z &gt; w</p>');
});

test('legacy multi-line plain text becomes one paragraph per line, blank lines kept', () => {
  assert.equal(toEditor('one\n\ntwo\r\nthree\n'), '<p>one</p><p><br></p><p>two</p><p>three</p>');
  assert.equal(toEditor(''), '');
  assert.equal(toEditor(null), '');
});

// --- empty editor ------------------------------------------------------------------------------------------------------

test('an empty editor is stored as an empty string', () => {
  for (const blank of ['<p><br></p>', '<p></p>', '<p> </p>', '<p>&nbsp;</p>', '<p><br></p><p><br></p>', '  ', '', null, undefined]) {
    assert.equal(fromEditor(blank), '', JSON.stringify(blank));
    assert.equal(richText.isBlankHtml(blank), true, JSON.stringify(blank));
    assert.equal(richText.richTextOrNull(blank), null, JSON.stringify(blank));
  }
  for (const real of ['<p>Hi</p>', 'Hi', '<p><br></p><p>Hi</p>', '<ul><li>x</li></ul>', '<p><img src="https://x.test/a.png"></p>']) {
    assert.equal(richText.isBlankHtml(real), false, real);
    assert.equal(fromEditor(real), real);
  }
});

test('blank rich text counts as "no content" for dirty-state, the save payload and the publish checks', () => {
  const untouched = lessonOf({ text_content: '' });
  const afterFocus = lessonOf({ text_content: fromEditor('<p><br></p>') }); // what the form holds after Quill emits its empty state
  assert.deepEqual(toLessonFieldsPayload(afterFocus), toLessonFieldsPayload(untouched)); // nothing changed -> no save
  assert.equal(toLessonFieldsPayload(lessonOf({ text_content: '<p><br></p>' })).text_content, null); // even if one slips through
  assert.equal(toLessonFieldsPayload(lessonOf({ text_content: '<p>Hi</p>' })).text_content, '<p>Hi</p>');
  assert.equal(toLessonFieldsPayload(lessonOf({ lesson_type: 'assignment', text_content: '<p>Do it</p>' })).text_content, '<p>Do it</p>');
  assert.equal(toLessonFieldsPayload(lessonOf({ lesson_type: 'video', text_content: '<p>x</p>', content_url: 'https://a.test' })).text_content, null);
  assert.equal(toModuleFieldsPayload({ title: 'M', description: '<p><br></p>', unlock_rule: 'immediate' }).description, null);

  const gaps = program => getPublishRecommendations(program).map(item => item.message || item.text || JSON.stringify(item));
  const blankText = gaps({ modules: [{ title: 'M', lessons: [{ title: 'L', lesson_type: 'text', text_content: '<p><br></p>' }] }] });
  assert.ok(blankText.some(text => /has no text/.test(text)), JSON.stringify(blankText));
  const filled = gaps({ modules: [{ title: 'M', lessons: [{ title: 'L', lesson_type: 'text', text_content: '<p>Hi</p>' }] }] });
  assert.ok(!filled.some(text => /has no text/.test(text)));
});

// --- toolbar vs the backend allow-list ---------------------------------------------------------------------------------

// BACKEND2026/Certification/sanitizers.py (kept here so the check runs without the backend checkout, and compared with
// the real file below when it is there).
const BACKEND_TAGS = new Set([
  'p', 'br', 'hr', 'span', 'div', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'blockquote', 'code', 'pre',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img',
]);
const BACKEND_ATTRIBUTES = { a: new Set(['href', 'title', 'target']), img: new Set(['src', 'alt', 'title', 'width', 'height']) };

// What Quill 1.x (react-quill's bundled 1.3.7) writes for each format it offers here.
const QUILL_OUTPUT = {
  header: { tags: ['h1', 'h2', 'h3'] },
  bold: { tags: ['strong'] },
  italic: { tags: ['em'] },
  underline: { tags: ['u'] },
  strike: { tags: ['s'] },
  list: { tags: ['ol', 'li'] },
  bullet: { tags: ['ul', 'li'] },
  link: { tags: ['a'], attributes: { a: ['href', 'target'] } }, // Quill also adds rel, which the backend replaces with its own
};
// Quill 1.x writes these as `class="ql-…"` or inline `style`, which the backend strips: they must never be offered.
const WRITES_CLASS_OR_STYLE = ['align', 'indent', 'color', 'background', 'size', 'font', 'code-block', 'direction', 'image', 'video', 'formula'];

const toolbarFormats = () =>
  new Set(
    richText.CERTIFICATION_RICH_TEXT_TOOLBAR.flat().flatMap(item => (typeof item === 'string' ? [item] : Object.keys(item))).filter(name => name !== 'clean')
  );

test('every toolbar button produces only tags and attributes the backend sanitizer keeps', () => {
  const offered = toolbarFormats();
  assert.deepEqual([...offered].sort(), ['bold', 'header', 'italic', 'link', 'list', 'strike', 'underline']);
  for (const format of [...offered, ...richText.CERTIFICATION_RICH_TEXT_FORMATS]) {
    const output = QUILL_OUTPUT[format];
    assert.ok(output, `no output mapping for format "${format}"`);
    for (const tag of output.tags) assert.ok(BACKEND_TAGS.has(tag), `<${tag}> (from "${format}") is stripped by the backend`);
    for (const [tag, attributes] of Object.entries(output.attributes || {})) {
      for (const attribute of attributes) assert.ok(BACKEND_ATTRIBUTES[tag]?.has(attribute), `${tag}[${attribute}] (from "${format}") is stripped by the backend`);
    }
  }
});

test('nothing that is written as a class or inline style (align, indent, colour, size, images...) is offered', () => {
  const everything = new Set([...toolbarFormats(), ...richText.CERTIFICATION_RICH_TEXT_FORMATS]);
  for (const format of WRITES_CLASS_OR_STYLE) assert.ok(!everything.has(format), `"${format}" would be stripped on save`);
  // every toolbar format can actually be applied (listed in formats)
  for (const format of toolbarFormats()) assert.ok(richText.CERTIFICATION_RICH_TEXT_FORMATS.includes(format), format);
  assert.deepEqual(richText.CERTIFICATION_RICH_TEXT_MODULES, { toolbar: richText.CERTIFICATION_RICH_TEXT_TOOLBAR });
});

test('the allow-list copied above still matches the backend sanitizer (checked when the backend checkout is present)', t => {
  const file = path.resolve(__dirname, '../../../../../../BACKEND2026/Certification/sanitizers.py');
  if (!fs.existsSync(file)) return t.skip('backend checkout not found');
  const source = fs.readFileSync(file, 'utf8');
  const block = source.slice(source.indexOf('ALLOWED_TAGS = {'), source.indexOf('ALLOWED_ATTRIBUTES'));
  const tags = new Set([...block.matchAll(/'([a-z0-9]+)'/g)].map(match => match[1]));
  assert.deepEqual([...tags].sort(), [...BACKEND_TAGS].sort());
  const attrBlock = source.slice(source.indexOf('ALLOWED_ATTRIBUTES'), source.indexOf('LINK_URL_SCHEMES'));
  assert.ok(!/'class'|'style'/.test(attrBlock), 'the backend now allows class/style: align and indent could be re-enabled');
  assert.match(attrBlock, /'a': \{'href', 'title', 'target'\}/);
});

// --- editor wiring -------------------------------------------------------------------------------------------------------

const renderField = (value, props = {}) =>
  render(
    React.createElement(
      realFormik.Formik,
      { initialValues: { text: value }, onSubmit() {} },
      React.createElement(CertificationRichTextField, { name: 'text', label: 'Text Content', ...props })
    )
  );

test('the field gives the shared editor the trimmed toolbar, the allowed formats and the converted value', () => {
  renderField('a & b');
  const props = harness.quillProps;
  assert.equal(props.modules, richText.CERTIFICATION_RICH_TEXT_MODULES); // the same object each render: the editor is not rebuilt
  assert.equal(props.formats, richText.CERTIFICATION_RICH_TEXT_FORMATS);
  assert.equal(props.value, '<p>a &amp; b</p>'); // legacy text shown without double escaping
  assert.equal(props.readOnly, false);
  assert.equal(props.theme, 'snow');
  renderField('', { disabled: true });
  assert.equal(harness.quillProps.readOnly, true);
  assert.equal(harness.quillProps.value, '');
});

test('editor changes only update the form value (empty becomes ""), and blur only marks the field touched', () => {
  stub.fakeField = { value: '' };
  renderField('');
  const { onChange, onBlur } = harness.quillProps;
  onChange('<p>H</p>');
  onChange('<p>Hi</p>');
  onChange('<p>Hi &amp; bye</p>');
  onChange('<p><br></p>');
  assert.deepEqual(stub.setValues, ['<p>H</p>', '<p>Hi</p>', '<p>Hi &amp; bye</p>', '']); // no HTML mangling, blank normalised
  assert.deepEqual(stub.touched, []);
  onBlur();
  assert.deepEqual(stub.touched, [true]);
});

test('the lesson form uses the editor for text and assignment lessons only, and wires no save callback into it', () => {
  const fields = lesson =>
    render(
      React.createElement(
        realFormik.Formik,
        { initialValues: { modules: [{ lessons: [lesson] }] }, onSubmit() {} },
        React.createElement(LessonContentFields, { namePrefix: 'modules[0].lessons[0]', lesson, disabled: false, onLessonChange() {} })
      )
    );
  for (const type of ['text', 'assignment']) {
    harness.quillProps = null;
    assert.match(fields(lessonOf({ lesson_type: type })), /data-quill="editor"/, type);
    assert.ok(harness.quillProps, type);
    // the editor only receives editor props: nothing that could save on change
    for (const key of Object.keys(harness.quillProps)) assert.ok(['theme', 'value', 'onChange', 'onBlur', 'placeholder', 'modules', 'formats', 'style', 'readOnly'].includes(key), key);
  }
  for (const type of ['video', 'pdf', 'link', 'quiz']) {
    harness.quillProps = null;
    assert.doesNotMatch(fields(lessonOf({ lesson_type: type })), /data-quill/, type);
  }
});

// --- autosave: once per blur, never per keystroke ----------------------------------------------------------------------------

// A just-enough hook runtime so the real useSectionAutosave can be driven directly (it only needs refs, state and callbacks).
const fakeReact = () => {
  const slots = [];
  let cursor = 0;
  return {
    useRef: initial => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useState: initial => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = value; }];
    },
    useCallback: fn => fn,
    useEffect: () => {},
  };
};

const mountAutosave = () => {
  stub.react = fakeReact();
  const autosaveHook = freshRequire('hooks/useSectionAutosave').default; // driven directly on the fake runtime, not in a component
  const saved = [];
  const autosave = autosaveHook(async values => { saved.push(values); });
  autosave.markSaved({ text_content: null }); // what the pane does when it opens
  return { autosave, saved };
};
const settle = async () => { for (let i = 0; i < 5; i += 1) await Promise.resolve(); };

test('typing saves nothing; one blur saves exactly once after the debounce', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { autosave, saved } = mountAutosave();
  // keystrokes only change the form value: no save is scheduled
  t.mock.timers.tick(10_000);
  await settle();
  assert.equal(saved.length, 0);

  autosave.notifyBlur({ text_content: '<p>Hello</p>' }); // the pane's form onBlur
  t.mock.timers.tick(699);
  await settle();
  assert.equal(saved.length, 0);
  t.mock.timers.tick(1);
  await settle();
  assert.deepEqual(saved, [{ text_content: '<p>Hello</p>' }]);
  t.mock.timers.tick(10_000);
  await settle();
  assert.equal(saved.length, 1);
});

test('several blurs in quick succession (editor, then toolbar, then link box) still save once, with the latest text', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { autosave, saved } = mountAutosave();
  for (const html of ['<p>A</p>', '<p>AB</p>', '<p>ABC</p>', '<p>ABC</p>']) {
    autosave.notifyBlur({ text_content: html });
    t.mock.timers.tick(200);
  }
  t.mock.timers.tick(700);
  await settle();
  assert.deepEqual(saved, [{ text_content: '<p>ABC</p>' }]);
});

test('a blur with nothing changed (or an emptied-and-refocused editor) does not save', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { autosave, saved } = mountAutosave();
  autosave.notifyBlur({ text_content: toLessonFieldsPayload(lessonOf({ text_content: fromEditor('<p><br></p>') })).text_content });
  t.mock.timers.tick(5000);
  await settle();
  assert.equal(saved.length, 0);
});

// --- learner view -------------------------------------------------------------------------------------------------------------

test('learner text is sanitized through DOMPurify (with new-tab links forced to rel="noopener noreferrer")', () => {
  const calls = { hooks: [], sanitize: [] };
  stub.purify = {
    addHook: (name, fn) => calls.hooks.push([name, fn]),
    sanitize: (html, options) => { calls.sanitize.push([html, options]); return '<p>clean</p>'; },
  };
  const fresh = freshRequire('utils/richTextSafety');
  const dirty = '<p onclick="steal()">hi</p><script>alert(1)</script><a href="https://x.test" target="_blank">x</a>';
  assert.equal(fresh.sanitizeRichHtml(dirty), '<p>clean</p>');
  fresh.sanitizeRichHtml('<p>again</p>');
  assert.deepEqual(calls.sanitize[0], [dirty, { ADD_ATTR: ['target'] }]); // DOMPurify gets the raw HTML and keeps `target`
  assert.equal(calls.hooks.length, 1); // installed once, not per call
  assert.deepEqual([calls.hooks[0][0], calls.hooks[0][1] === fresh.ensureSafeLinkRel], ['afterSanitizeAttributes', true]);
});

test('links that open a new tab get rel="noopener noreferrer"; other nodes are left alone', () => {
  const node = (tagName, attributes = {}) => ({
    tagName, attributes: { ...attributes },
    hasAttribute(name) { return name in this.attributes; },
    setAttribute(name, value) { this.attributes[name] = value; },
  });
  const blank = node('A', { href: 'https://x.test', target: '_blank', rel: 'opener' });
  safety.ensureSafeLinkRel(blank);
  assert.equal(blank.attributes.rel, 'noopener noreferrer');
  const sameTab = node('a', { href: 'https://x.test' });
  safety.ensureSafeLinkRel(sameTab);
  assert.equal(sameTab.attributes.rel, undefined);
  const paragraph = node('P', { target: '_blank' });
  safety.ensureSafeLinkRel(paragraph);
  assert.equal(paragraph.attributes.rel, undefined);
  assert.doesNotThrow(() => safety.ensureSafeLinkRel(null));
});

test('the learner reading never puts raw author HTML on the page before it has been sanitized', () => {
  const hostile = '<p onclick="steal()">hi</p><script>alert(1)</script><img src=x onerror=alert(2)>';
  const html = render(React.createElement(TextLesson, { lesson: { id: 1, text_content: hostile, lesson_type: 'text' }, programId: 5 }));
  // DOMPurify needs a DOM, so ControllableRichText renders nothing until it has mounted; the server output has none of it
  for (const forbidden of ['<script', 'onclick', 'onerror', 'alert(', 'steal()']) assert.ok(!html.includes(forbidden), forbidden);
});
