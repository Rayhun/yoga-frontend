// Tests for the audio / image lesson upload in the curriculum builder. Logic is tested directly; markup is
// server-rendered with stubbed framework pieces (shared harness). NOTHING here checks appearance, a real file
// chooser, a real upload or a real browser.
//
//   node -r sucrase/register -r ./src/components/certification/learner/__tests__/harness.cjs \
//        --test src/components/certification/builder/curriculum/__tests__/
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const harness = require('../../../learner/__tests__/harness.cjs');
const realFormik = require('formik');

// capture what LessonContentFields hands to LessonMediaField (only for that parent)
const captured = { mediaField: null };
const realLoad = Module._load;
Module._load = function (request, parent, ...rest) {
  const from = (parent && parent.filename) || '';
  if (request === './LessonMediaField' && from.endsWith('LessonContentFields.jsx')) {
    const real = realLoad.call(this, request, parent, ...rest);
    return {
      __esModule: true,
      default: props => {
        captured.mediaField = props;
        return React.createElement(real.default, props);
      },
    };
  }
  return realLoad.call(this, request, parent, ...rest);
};

const media = require('../lessonMedia');
const LessonMediaField = require('../LessonMediaField').default;
const LessonContentFields = require('../LessonContentFields').default;
const { LESSON_TYPE_OPTIONS } = require('../lessonTypes');
const fields = require('../../sections/curriculumFields');
const { getPublishRecommendations } = require('../../publish/readiness');
const { uploadCertificationFile } = require('@/services/private/certification/application');
const { getLessonType, MANUALLY_COMPLETABLE_TYPES } = require('../../../session/lessonTypes');
const { lessonChip } = require('../../../details/detailTabs');

const MB = 1024 * 1024;
const file = (name, size = 1000, type = '') => ({ name, size, type });
const render = element => renderToStaticMarkup(element);
const KEY = 'certification/application/lesson-song.mp3';

test.beforeEach(() => {
  harness.reset();
  captured.mediaField = null;
});

// --- type choices -----------------------------------------------------------------------------------------------

test('the lesson type choices include Audio and Image alongside the existing types', () => {
  const values = LESSON_TYPE_OPTIONS.map(option => option.value);
  assert.deepEqual(values, ['video', 'audio', 'image', 'pdf', 'text', 'quiz', 'assignment', 'link']);
  assert.ok(LESSON_TYPE_OPTIONS.find(option => option.value === 'audio').label.includes('Audio'));
  assert.ok(LESSON_TYPE_OPTIONS.find(option => option.value === 'image').label.includes('Image'));
});

// --- client-side validation before any request -------------------------------------------------------------------------

test('a wrong file type is refused with a clear message', () => {
  assert.match(media.validateMediaFile('audio', file('notes.pdf')), /Choose an audio file \(mp3, m4a, wav, ogg, webm\)/);
  assert.match(media.validateMediaFile('audio', file('pic.png', 10, 'image/png')), /Choose an audio file/);
  assert.match(media.validateMediaFile('image', file('song.mp3', 10, 'audio/mpeg')), /Choose an image file \(jpg, jpeg, png, webp, gif\)/);
  assert.match(media.validateMediaFile('image', file('vector.svg')), /Choose an image file/);
  assert.match(media.validateMediaFile('image', file('noextension')), /Choose an image file/);
  assert.match(media.validateMediaFile('audio', file('renamed.mp3', 10, 'text/html')), /doesn’t look like an audio file/);
  assert.match(media.validateMediaFile('audio', file('clip.webm', 10, 'video/webm')), /WebM file is identified as video/);
  assert.match(media.validateMediaFile('video', file('a.mp4')), /does not take a file/);
  assert.match(media.validateMediaFile('audio', null), /Choose a file/);
});

test('an oversize file is refused with its size and the limit (image 5 MB, audio 50 MB)', () => {
  assert.equal(media.validateMediaFile('image', file('a.png', 5 * MB, 'image/png')), null); // exactly at the limit
  assert.equal(media.validateMediaFile('audio', file('a.mp3', 50 * MB, 'audio/mpeg')), null);
  assert.equal(media.validateMediaFile('image', file('a.PNG', 5 * MB + 1, 'image/png')), 'Image files can be at most 5 MB (this file is 5.0 MB).');
  assert.equal(media.validateMediaFile('audio', file('a.mp3', 60 * MB, 'audio/mpeg')), 'Audio files can be at most 50 MB (this file is 60.0 MB).');
  assert.match(media.validateMediaFile('image', file('a.png', 0, 'image/png')), /empty/);
});

test('every allowed extension passes, including upper case and a missing browser type', () => {
  for (const name of ['a.mp3', 'a.M4A', 'a.wav', 'a.ogg']) assert.equal(media.validateMediaFile('audio', file(name, 10)), null, name);
  assert.equal(media.validateMediaFile('audio', file('a.webm', 10, 'audio/webm')), null);
  for (const name of ['a.jpg', 'a.jpeg', 'a.png', 'a.WEBP', 'a.gif']) assert.equal(media.validateMediaFile('image', file(name, 10)), null, name);
  assert.equal(media.acceptAttribute('image'), '.jpg,.jpeg,.png,.webp,.gif');
  assert.equal(media.acceptAttribute('audio'), '.mp3,.m4a,.wav,.ogg,.webm');
});

// --- the upload: sends kind, stores the returned key ---------------------------------------------------------------------

const runPick = async ({ lessonType = 'audio', chosen = file('song.mp3', 1000, 'audio/mpeg'), response, failWith } = {}) => {
  const calls = [];
  const changes = [];
  const states = [];
  const uploadFn = async args => {
    calls.push(args);
    if (failWith) throw failWith;
    args.onUploadProgress({ loaded: 50, total: 100 });
    return response === undefined ? { data: { file_key: KEY, file_link: 'https://signed.example/x' } } : response;
  };
  const stored = await media.pickLessonMedia({ lessonType, file: chosen, uploadFn, onChange: patch => changes.push(patch), onState: state => states.push(state) });
  return { stored, calls, changes, states };
};

test('an invalid file never reaches the upload and shows its message', async () => {
  const { stored, calls, changes, states } = await runPick({ chosen: file('notes.pdf') });
  assert.equal(stored, false);
  assert.equal(calls.length, 0);
  assert.equal(changes.length, 0);
  assert.equal(states.at(-1).status, 'error');
  assert.match(states.at(-1).error, /Choose an audio file/);
  const big = await runPick({ lessonType: 'image', chosen: file('big.png', 6 * MB, 'image/png') });
  assert.equal(big.calls.length, 0);
  assert.match(big.states.at(-1).error, /at most 5 MB/);
});

test('upload sends kind with the file and stores the returned key as content_url (the pane then autosaves)', async () => {
  const chosen = file('song.mp3', 1000, 'audio/mpeg');
  const { stored, calls, changes, states } = await runPick({ chosen });
  assert.equal(stored, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].file, chosen);
  assert.equal(calls[0].kind, 'audio');
  assert.equal(typeof calls[0].onUploadProgress, 'function');
  assert.deepEqual(changes, [{ content_url: KEY, signed_content_url: '' }]); // the key, never the link
  assert.deepEqual(states.map(state => state.status), ['uploading', 'uploading', 'idle']);
  assert.equal(states[1].progress, 50);
  const image = await runPick({ lessonType: 'image', chosen: file('pic.png', 10, 'image/png') });
  assert.equal(image.calls[0].kind, 'image');
});

test('server errors and a missing key are shown and store nothing', async () => {
  const refused = await runPick({ failWith: Object.assign(new Error('400'), { response: { status: 400, data: { message: 'Audio files can be at most 50 MB (this file is 51.0 MB).' } } }) });
  assert.equal(refused.stored, false);
  assert.equal(refused.changes.length, 0);
  assert.match(refused.states.at(-1).error, /at most 50 MB/);
  const noKey = await runPick({ response: { data: { file_link: 'https://signed.example/x' } } });
  assert.equal(noKey.stored, false);
  assert.equal(noKey.changes.length, 0);
  assert.match(noKey.states.at(-1).error, /did not return a file key/);
});

test('the shared upload service posts kind (only when given) and reports progress', async () => {
  const chosen = new Blob(['x'], { type: 'audio/mpeg' });
  const onUploadProgress = () => {};
  await uploadCertificationFile({ file: chosen, kind: 'audio', onUploadProgress });
  await uploadCertificationFile({ file: chosen });
  const [withKind, without] = harness.axiosCalls;
  assert.equal(withKind.url, '/certification/file/upload/');
  assert.equal(withKind.body.get('kind'), 'audio');
  assert.ok(withKind.body.get('file'));
  assert.equal(withKind.config.onUploadProgress, onUploadProgress);
  assert.equal(without.body.get('kind'), null); // existing callers are unchanged
  assert.equal('onUploadProgress' in without.config, false);
});

// --- switching type -------------------------------------------------------------------------------------------------------

test('switching between a link type and audio / image clears content_url; between link types it is kept', () => {
  const lesson = type => ({ lesson_type: type, content_url: type === 'audio' ? KEY : 'https://youtube.com/watch?v=abc', signed_content_url: 'https://signed.example/x' });
  for (const [from, to] of [['video', 'audio'], ['video', 'image'], ['pdf', 'audio'], ['link', 'image'], ['audio', 'video'], ['audio', 'pdf'], ['audio', 'image'], ['audio', 'text']]) {
    assert.deepEqual(fields.lessonTypeChangePatch(lesson(from), to), { lesson_type: to, content_url: '', signed_content_url: '' }, `${from} -> ${to}`);
  }
  assert.deepEqual(fields.lessonTypeChangePatch(lesson('video'), 'pdf'), { lesson_type: 'pdf' }); // link kept
  assert.deepEqual(fields.lessonTypeChangePatch(lesson('audio'), 'audio'), { lesson_type: 'audio' });
});

test('after switching a video to audio, the save sends no link as the audio key', () => {
  const lesson = { lesson_type: 'video', title: 'L', content_url: 'https://youtube.com/watch?v=abc', text_content: '', duration_minutes: '' };
  const switched = { ...lesson, ...fields.lessonTypeChangePatch(lesson, 'audio') };
  const payload = fields.toLessonFieldsPayload(switched);
  assert.equal(payload.lesson_type, 'audio');
  assert.equal(payload.content_url, null);
});

// --- payload and form values -------------------------------------------------------------------------------------------------

test('the key is saved as content_url for audio and image, signed_content_url is never sent, other types drop it', () => {
  const base = { title: 'L', text_content: '', duration_minutes: '', signed_content_url: 'https://signed.example/x' };
  for (const type of ['audio', 'image']) {
    const payload = fields.toLessonFieldsPayload({ ...base, lesson_type: type, content_url: KEY });
    assert.equal(payload.content_url, KEY);
    assert.equal(payload.lesson_type, type);
    assert.equal('signed_content_url' in payload, false);
    assert.equal(fields.toLessonFieldsPayload({ ...base, lesson_type: type, content_url: '' }).content_url, null); // removed file
  }
  assert.equal(fields.toLessonFieldsPayload({ ...base, lesson_type: 'text', content_url: KEY }).content_url, null);
  assert.equal(fields.toLessonFieldsPayload({ ...base, lesson_type: 'video', content_url: 'https://youtube.com/watch?v=abc' }).content_url, 'https://youtube.com/watch?v=abc');
});

test('creator responses load into the form with the key and the read-only preview link', () => {
  const form = fields.toLessonFormValues({ id: 4, title: 'Song', lesson_type: 'audio', content_url: KEY, signed_content_url: 'https://signed.example/x' });
  assert.equal(form.content_url, KEY);
  assert.equal(form.signed_content_url, 'https://signed.example/x');
  assert.equal(fields.blankLesson().signed_content_url, '');
});

test('publish readiness reports an audio or image lesson without a file', () => {
  const messages = lessons => getPublishRecommendations({ modules: [{ title: 'M', lessons }] }).map(item => item.message);
  const empty = messages([{ id: 1, title: 'Song', lesson_type: 'audio', content_url: '' }, { id: 2, title: 'Pic', lesson_type: 'image', content_url: null }]);
  assert.ok(empty.some(text => /“Song” has no file/.test(text)), JSON.stringify(empty));
  assert.ok(empty.some(text => /“Pic” has no file/.test(text)));
  assert.deepEqual(messages([{ id: 3, title: 'Song', lesson_type: 'audio', content_url: KEY }]), []);
});

// --- the form: no free-text URL for these types ----------------------------------------------------------------------------------

const renderFields = (lesson, onLessonChange = () => {}) =>
  render(
    React.createElement(
      realFormik.Formik,
      { initialValues: { modules: [{ lessons: [lesson] }] }, onSubmit() {} },
      React.createElement(LessonContentFields, { namePrefix: 'modules[0].lessons[0]', lesson, disabled: false, onLessonChange })
    )
  );
const lessonOf = overrides => ({ lesson_type: 'video', title: 'Breathing', content_url: '', signed_content_url: '', text_content: '', duration_minutes: '', ...overrides });

test('audio and image lessons show the upload control and NO field where a URL could be typed or pasted', () => {
  for (const type of ['audio', 'image']) {
    captured.mediaField = null;
    const html = renderFields(lessonOf({ lesson_type: type, content_url: KEY }));
    assert.ok(captured.mediaField, type);
    assert.equal(captured.mediaField.lessonType, type);
    assert.equal(captured.mediaField.value, KEY);
    assert.doesNotMatch(html, /name="modules\[0\]\.lessons\[0\]\.content_url"/, type);
    assert.doesNotMatch(html, /placeholder="https:/, type);
    assert.doesNotMatch(html, /type="url"/, type);
    assert.match(html, /<input id="lesson-(audio|image)-file" type="file"/, type);
    assert.doesNotMatch(html, /isn’t used by this lesson type/, 'a stored key must not trigger the "link not used" notice');
  }
  captured.mediaField = null;
  const video = renderFields(lessonOf({ lesson_type: 'video' }));
  assert.match(video, /name="modules\[0\]\.lessons\[0\]\.content_url"/); // the control: other types keep their URL field
  assert.equal(captured.mediaField, null);
});

test('the upload control reports changes through the lesson pane handler (so it autosaves like any edit)', () => {
  const onLessonChange = () => {};
  renderFields(lessonOf({ lesson_type: 'audio' }), onLessonChange);
  assert.equal(captured.mediaField.onChange, onLessonChange);
});

// --- the upload control markup -------------------------------------------------------------------------------------------------

const field = props => render(React.createElement(LessonMediaField, { lessonType: 'audio', title: 'Breathing', value: '', previewUrl: '', onChange() {}, ...props }));

test('empty: a labelled file input, an upload button, the allowed types and limit, no Replace / Remove', () => {
  const html = field({});
  assert.match(html, /<label for="lesson-audio-file"[^>]*>Audio file<\/label>/);
  assert.match(html, /<input id="lesson-audio-file" type="file" accept="\.mp3,\.m4a,\.wav,\.ogg,\.webm"[^>]*aria-label="Choose an audio file to upload"/);
  assert.match(html, />Upload audio</);
  assert.match(html, /mp3, m4a, wav, ogg, webm · up to 50 MB/);
  assert.doesNotMatch(html, />Replace<|>Remove</);
  assert.ok(html.includes('min-h-[44px]'));
  assert.match(field({ lessonType: 'image' }), /accept="\.jpg,\.jpeg,\.png,\.webp,\.gif"[^>]*aria-label="Choose an image file to upload"/);
  assert.match(field({ lessonType: 'image' }), /up to 5 MB/);
});

test('with a saved file: a keyboard-reachable audio player or an image with alt text, plus Replace and Remove', () => {
  const audio = field({ value: KEY, previewUrl: 'https://signed.example/a.mp3' });
  assert.match(audio, /<audio controls[^>]*src="https:\/\/signed\.example\/a\.mp3"[^>]*aria-label="Preview of Breathing audio"/);
  assert.match(audio, />Replace</);
  assert.match(audio, />Remove</);
  const image = field({ lessonType: 'image', value: 'certification/application/p.png', previewUrl: 'https://signed.example/p.png' });
  assert.match(image, /<img src="https:\/\/signed\.example\/p\.png" alt="Breathing \(preview\)"/);
  assert.match(image, />Replace</);
  assert.match(image, />Remove</);
});

test('a saved file without a preview link yet shows its name; the control is disabled when the pane is', () => {
  assert.match(field({ value: KEY }), /File uploaded: lesson-song\.mp3/);
  const disabled = field({ value: KEY, previewUrl: 'https://signed.example/a.mp3', disabled: true });
  assert.match(disabled, /<button[^>]*disabled=""[^>]*>Replace<\/button>/);
  assert.match(disabled, /<button[^>]*disabled=""[^>]*>Remove<\/button>/);
});

// --- chips and icons -------------------------------------------------------------------------------------------------------------

test('audio and image have chips and icons; an unknown type still falls back', () => {
  assert.equal(getLessonType('audio').label, 'Audio');
  assert.equal(getLessonType('image').label, 'Image');
  assert.equal(typeof getLessonType('audio').icon, 'function');
  assert.equal(lessonChip('audio').known, true);
  assert.equal(lessonChip('image').label, 'Image');
  assert.equal(getLessonType('hologram').label, 'Lesson'); // fallback
  assert.equal(lessonChip('hologram').known, false);
  assert.ok(MANUALLY_COMPLETABLE_TYPES.includes('audio') && MANUALLY_COMPLETABLE_TYPES.includes('image'));
});
