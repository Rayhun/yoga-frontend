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
const LINK = 'https://cdn.example.com/podcast/ep1.mp3';

// MEDIA_UPLOAD_ENABLED is a plain object read at render time, so a test can switch uploads on for one call.
const withUploads = (types, run) => {
  const saved = { ...media.MEDIA_UPLOAD_ENABLED };
  types.forEach(type => {
    media.MEDIA_UPLOAD_ENABLED[type] = true;
  });
  try {
    return run();
  } finally {
    Object.assign(media.MEDIA_UPLOAD_ENABLED, saved);
  }
};

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

test('uploads are off by default for video, audio and image', () => {
  assert.deepEqual(media.MEDIA_UPLOAD_ENABLED, { video: false, audio: false, image: false });
  assert.equal(media.isMediaUploadEnabled('audio'), false);
});

test('switching types keeps a pasted link everywhere, and drops an uploaded file\'s key (it only suits its own type)', () => {
  const linked = { lesson_type: 'video', content_url: 'https://youtube.com/watch?v=abc', signed_content_url: 'https://youtube.com/watch?v=abc' };
  for (const to of ['audio', 'image', 'pdf', 'link', 'text']) {
    assert.deepEqual(fields.lessonTypeChangePatch(linked, to), { lesson_type: to }, `link video -> ${to}`);
  }
  const uploaded = { lesson_type: 'audio', content_url: KEY, signed_content_url: 'https://signed.example/x' };
  for (const to of ['video', 'image', 'pdf', 'text']) {
    assert.deepEqual(fields.lessonTypeChangePatch(uploaded, to), { lesson_type: to, content_url: '', signed_content_url: '' }, `file audio -> ${to}`);
  }
  assert.deepEqual(fields.lessonTypeChangePatch(uploaded, 'audio'), { lesson_type: 'audio' }); // same type: nothing to do
});

test('with uploads on, a link moved onto that audio / image lesson is cleared (it must then be an uploaded key)', () => {
  const linked = { lesson_type: 'video', content_url: 'https://youtube.com/watch?v=abc', signed_content_url: '' };
  withUploads(['audio'], () => {
    assert.deepEqual(fields.lessonTypeChangePatch(linked, 'audio'), { lesson_type: 'audio', content_url: '', signed_content_url: '' });
    assert.deepEqual(fields.lessonTypeChangePatch(linked, 'image'), { lesson_type: 'image' }); // image uploads still off
  });
});

test('after switching a video to audio, the save sends the link as the audio link', () => {
  const lesson = { lesson_type: 'video', title: 'L', content_url: LINK, text_content: '', duration_minutes: '' };
  const switched = { ...lesson, ...fields.lessonTypeChangePatch(lesson, 'audio') };
  const payload = fields.toLessonFieldsPayload(switched);
  assert.equal(payload.lesson_type, 'audio');
  assert.equal(payload.content_url, LINK);
});

test('usesLinkInput: video / pdf / link always; audio / image while their upload is off', () => {
  for (const type of ['video', 'audio', 'image', 'pdf', 'link']) assert.equal(fields.usesLinkInput(type), true, type);
  for (const type of ['text', 'quiz', 'assignment']) assert.equal(fields.usesLinkInput(type), false, type);
  withUploads(['audio'], () => {
    assert.equal(fields.usesLinkInput('audio'), false);
    assert.equal(fields.usesLinkInput('image'), true);
  });
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

test('publish readiness: video / audio / image need a valid https link or a legacy uploaded file, each with a Fix target', () => {
  const recs = lessons => getPublishRecommendations({ modules: [{ title: 'M', lessons }] });
  const messages = lessons => recs(lessons).map(item => item.message);
  const empty = messages([
    { id: 1, title: 'Song', lesson_type: 'audio', content_url: '' },
    { id: 2, title: 'Pic', lesson_type: 'image', content_url: null },
    { id: 3, title: 'Clip', lesson_type: 'video', content_url: '   ' },
  ]);
  assert.ok(empty.some(text => /“Song” has no link/.test(text)), JSON.stringify(empty));
  assert.ok(empty.some(text => /“Pic” has no link/.test(text)));
  assert.ok(empty.some(text => /“Clip” has no link/.test(text)));
  const invalid = messages([
    { id: 4, title: 'Old', lesson_type: 'video', content_url: 'http://old.example.com/v.mp4' },
    { id: 5, title: 'Typo', lesson_type: 'audio', content_url: 'cdn.example.com/a.mp3' },
  ]);
  assert.equal(invalid.length, 2);
  assert.ok(invalid.every(text => /has an invalid link/.test(text)), JSON.stringify(invalid));
  assert.deepEqual(
    messages([
      { id: 6, title: 'Song', lesson_type: 'audio', content_url: KEY }, // legacy uploaded file
      { id: 7, title: 'Clip', lesson_type: 'video', content_url: 'https://youtube.com/watch?v=abc' },
      { id: 8, title: 'Pic', lesson_type: 'image', content_url: 'https://images.example.org/p.png' },
    ]),
    []
  );
  // each gap links to the exact lesson
  const [first] = recs([{ id: 9, title: 'Song', lesson_type: 'audio', content_url: '' }]);
  assert.deepEqual(first.target, { step: 'curriculum', fold: null, item: { type: 'lesson', id: 9 } });
  // PDF and Link are unchanged
  assert.equal(messages([{ id: 10, title: 'Doc', lesson_type: 'pdf', content_url: '' }]).length, 1);
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

test('video, audio and image show ONLY a link input (no file upload) while uploads are off', () => {
  for (const type of ['video', 'audio', 'image']) {
    captured.mediaField = null;
    const html = renderFields(lessonOf({ lesson_type: type, content_url: LINK }));
    assert.ok(captured.mediaField, type);
    assert.equal(captured.mediaField.lessonType, type);
    assert.match(html, /name="modules\[0\]\.lessons\[0\]\.content_url"/, type);
    assert.match(html, /placeholder="https:\/\/"/, type);
    assert.ok(html.includes(media.LESSON_URL_HELP[type]), type);
    assert.doesNotMatch(html, /Google Drive|Dropbox/, type);
    assert.match(html, new RegExp(`${type[0].toUpperCase()}${type.slice(1)} URL`), type);
    assert.doesNotMatch(html, /type="file"/, type);
    assert.doesNotMatch(html, /Upload (audio|image)/, type);
    assert.doesNotMatch(html, /alert/, 'a valid link shows no error');
  }
  captured.mediaField = null;
  const pdf = renderFields(lessonOf({ lesson_type: 'pdf' }));
  assert.match(pdf, /name="modules\[0\]\.lessons\[0\]\.content_url"/); // PDF / Link keep their plain URL field
  assert.equal(captured.mediaField, null);
  assert.doesNotMatch(pdf, /Paste a (public|direct) https link/);
});

test('an invalid link is explained under the field as the creator types', () => {
  const html = renderFields(lessonOf({ lesson_type: 'audio', content_url: 'http://cdn.example.com/a.mp3' }));
  assert.match(html, /role="alert"[^>]*>Use a full https:\/\/ link/);
  assert.match(html, /aria-invalid="true"/);
});

test('a lesson with an uploaded file shows "Uploaded file in use", keeps it, and offers a link instead', () => {
  const changes = [];
  const html = renderFields(lessonOf({ lesson_type: 'audio', content_url: KEY, signed_content_url: 'https://signed.example/a.mp3' }), patch => changes.push(patch));
  assert.match(html, /Uploaded file in use/);
  assert.match(html, /<audio controls[^>]*src="https:\/\/signed\.example\/a\.mp3"/);
  assert.match(html, />Replace with a link</);
  assert.doesNotMatch(html, /name="modules\[0\]\.lessons\[0\]\.content_url"/, 'no input that could overwrite the file by accident');
  assert.doesNotMatch(html, /isn’t used by this lesson type/);
  assert.deepEqual(changes, [], 'rendering / saving changes nothing');
  // the saved value stays the key (saving without changes keeps the file)
  const payload = fields.toLessonFieldsPayload({ ...lessonOf({ lesson_type: 'audio', content_url: KEY, signed_content_url: 'x' }) });
  assert.equal(payload.content_url, KEY);
  assert.equal('signed_content_url' in payload, false);
});

test('"Replace with a link" clears the file so the link input appears; an image shows its preview as a plain img', () => {
  const LessonUrlField = require('../LessonUrlField').default;
  const changes = [];
  const tree = LessonUrlField({ namePrefix: 'x', lessonType: 'image', title: 'Pic', value: 'certification/application/p.png', previewUrl: 'https://signed.example/p.png', onChange: patch => changes.push(patch) });
  const buttons = [];
  const walk = node => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (node.type === 'button') buttons.push(node);
    walk(node.props?.children);
  };
  walk(tree);
  assert.equal(buttons.length, 1);
  buttons[0].props.onClick();
  assert.deepEqual(changes, [{ content_url: '', signed_content_url: '' }]);
  const html = render(tree);
  assert.match(html, /<img src="https:\/\/signed\.example\/p\.png" alt="Pic \(preview\)"/);
});

test('with uploads switched on the upload control is back (the code is kept), for that type only', () => {
  withUploads(['audio'], () => {
    const audio = renderFields(lessonOf({ lesson_type: 'audio', content_url: KEY }));
    assert.match(audio, /<input id="lesson-audio-file" type="file"/);
    assert.doesNotMatch(audio, /name="modules\[0\]\.lessons\[0\]\.content_url"/);
    const image = renderFields(lessonOf({ lesson_type: 'image', content_url: LINK }));
    assert.doesNotMatch(image, /type="file"/);
    assert.match(image, /name="modules\[0\]\.lessons\[0\]\.content_url"/);
  });
});

// --- helper text per type and the page-link warning -------------------------------------------------------------------------

test('helper text per type, with no mention of Google Drive or Dropbox', () => {
  assert.equal(media.lessonUrlHelp('video'), 'Paste a public https link: YouTube, Vimeo or a direct video file (.mp4).');
  assert.equal(media.lessonUrlHelp('audio'), 'Paste a direct https link to an audio file (.mp3, .m4a, .wav).');
  assert.equal(media.lessonUrlHelp('image'), 'Paste a direct https link to an image file (.jpg, .png, .webp).');
  assert.equal(media.lessonUrlHelp('pdf'), '');
  for (const text of Object.values(media.LESSON_URL_HELP)) assert.doesNotMatch(text, /drive|dropbox/i);
});

const WARNING_AUDIO = 'This looks like a page link. Use a direct file link so learners can play it.';
const WARNING_IMAGE = 'This looks like a page link. Use a direct file link so learners can see it.';

test('page-link warning: Google Drive and Docs links warn for audio and image', () => {
  for (const url of ['https://drive.google.com/file/d/abc123/view?usp=sharing', 'https://docs.google.com/document/d/abc/edit', 'https://DRIVE.google.com/open?id=abc']) {
    assert.equal(media.pageLinkWarning('audio', url), WARNING_AUDIO, url);
    assert.equal(media.pageLinkWarning('image', url), WARNING_IMAGE, url);
  }
});

test('page-link warning: Dropbox warns unless the link is a direct form (raw=1 or dl=1)', () => {
  for (const host of ['www.dropbox.com', 'dropbox.com']) {
    assert.equal(media.pageLinkWarning('audio', `https://${host}/s/abc/ep1.mp3`), WARNING_AUDIO, host);
    assert.equal(media.pageLinkWarning('audio', `https://${host}/s/abc/ep1.mp3?dl=0`), WARNING_AUDIO, `${host} dl=0`);
    assert.equal(media.pageLinkWarning('image', `https://${host}/s/abc/p.png?rlkey=k&dl=0`), WARNING_IMAGE, host);
    assert.equal(media.pageLinkWarning('audio', `https://${host}/s/abc/ep1.mp3?raw=1`), null, `${host} raw=1`);
    assert.equal(media.pageLinkWarning('audio', `https://${host}/s/abc/ep1.mp3?dl=1`), null, `${host} dl=1`);
    assert.equal(media.pageLinkWarning('image', `https://${host}/s/abc/p.png?rlkey=k&raw=1`), null, host);
  }
});

test('page-link warning: a normal host, video, blank and invalid links get none', () => {
  assert.equal(media.pageLinkWarning('audio', 'https://cdn.example.com/podcast/ep1.mp3'), null);
  assert.equal(media.pageLinkWarning('image', 'https://images.example.org/p.png'), null);
  assert.equal(media.pageLinkWarning('audio', 'https://notdropbox.com/s/abc'), null);
  assert.equal(media.pageLinkWarning('audio', 'https://drive.google.com.evil.example/file'), null);
  assert.equal(media.pageLinkWarning('video', 'https://drive.google.com/file/d/abc/view'), null);
  assert.equal(media.pageLinkWarning('audio', ''), null);
  assert.equal(media.pageLinkWarning('audio', 'http://drive.google.com/file/d/abc'), null); // invalid link: its own error shows instead
});

test('the warning is advisory: shown as a note under the input, no error, saving unchanged', () => {
  const warned = renderFields(lessonOf({ lesson_type: 'audio', content_url: 'https://drive.google.com/file/d/abc/view' }));
  assert.match(warned, /role="note"[^>]*>This looks like a page link\./);
  assert.doesNotMatch(warned, /role="alert"/);
  assert.doesNotMatch(warned, /aria-invalid="true"/);
  const payload = fields.toLessonFieldsPayload(lessonOf({ lesson_type: 'audio', content_url: 'https://drive.google.com/file/d/abc/view' }));
  assert.equal(payload.content_url, 'https://drive.google.com/file/d/abc/view');
  const clean = renderFields(lessonOf({ lesson_type: 'audio', content_url: 'https://cdn.example.com/a.mp3' }));
  assert.doesNotMatch(clean, /page link/);
  const video = renderFields(lessonOf({ lesson_type: 'video', content_url: 'https://drive.google.com/file/d/abc/view' }));
  assert.doesNotMatch(video, /page link/);
});

// --- link rules (the same as the backend's) --------------------------------------------------------------------------------------

test('validateLessonUrl accepts a plain https link and treats blank as "not typed yet"', () => {
  for (const ok of ['https://www.youtube.com/watch?v=abc123', 'https://cdn.example.com/a.mp3', 'https://images.example.org/p.png?w=800&q=80#top', '  https://vimeo.com/123  ', 'HTTPS://CDN.EXAMPLE.COM/A.MP3']) {
    assert.equal(media.validateLessonUrl(ok), null, ok);
  }
  for (const blank of ['', '   ', null, undefined]) assert.equal(media.validateLessonUrl(blank), null);
});

test('validateLessonUrl refuses http, other schemes, relative and malformed values, credentials, spaces and long links', () => {
  const bad = [
    'http://cdn.example.com/a.mp3', 'javascript:alert(1)', 'data:audio/mp3;base64,AAAA', 'blob:https://example.com/3b2f',
    'ftp://cdn.example.com/a.mp3', '//cdn.example.com/a.mp3', '/media/a.mp3', 'a.mp3', 'cdn.example.com/a.mp3',
    'https://', 'https:///a.mp3', 'https:/cdn.example.com/a.mp3', 'https://user:secret@cdn.example.com/a.mp3',
    'https://user@cdn.example.com/a.mp3', 'https://cdn example.com/a.mp3', 'https://cdn.example.com/a\nb.mp3', 'https://cdn.example.com\\a.mp3',
    'https://cdn.example.com/' + 'a'.repeat(200), 'not a url',
  ];
  for (const value of bad) assert.ok(media.validateLessonUrl(value), value.slice(0, 50));
  assert.match(media.validateLessonUrl('http://x.test/a'), /https/);
  assert.match(media.validateLessonUrl('https://u:p@x.test/a'), /username or password/);
  assert.match(media.validateLessonUrl('https://x.test/' + 'a'.repeat(200)), /too long/);
});

test('lessonContentKind tells a link from an uploaded file from nothing', () => {
  assert.equal(media.lessonContentKind(''), 'empty');
  assert.equal(media.lessonContentKind(null), 'empty');
  assert.equal(media.lessonContentKind(KEY), 'file');
  assert.equal(media.lessonContentKind(LINK), 'link');
  assert.equal(media.lessonContentKind('javascript:alert(1)'), 'link'); // not ours: judged as a link, then refused
  assert.equal(media.isStoredFileKey(LINK), false);
});

test('the upload control reports changes through the lesson pane handler (so it autosaves like any edit)', () => {
  const onLessonChange = () => {};
  renderFields(lessonOf({ lesson_type: 'audio' }), onLessonChange);
  assert.equal(captured.mediaField.onChange, onLessonChange);
});

// --- the upload control markup -------------------------------------------------------------------------------------------------

const field = props =>
  withUploads(['audio', 'image'], () =>
    render(React.createElement(LessonMediaField, { lessonType: 'audio', title: 'Breathing', value: '', previewUrl: '', onChange() {}, ...props }))
  );

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
