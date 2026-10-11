// Tests for the learner audio / image lessons: which element is rendered, and the "refresh once, then retry
// button" rule for an expired signed link. Markup is server-rendered with stubbed framework pieces (shared
// harness); NOTHING here checks real playback, real image loading, expiry against a live server or appearance.
//
//   node -r sucrase/register -r ./src/components/certification/learner/__tests__/harness.cjs \
//        --test src/components/certification/session/__tests__/
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const harness = require('../../learner/__tests__/harness.cjs');

const { createMediaRetry, MEDIA_STATUS } = require('../mediaRetry');
const AudioLesson = require('../lessons/AudioLesson').default;
const ImageLesson = require('../lessons/ImageLesson').default;
const MediaLoadError = require('../lessons/MediaLoadError').default;

const render = element => renderToStaticMarkup(element);
const SIGNED = 'https://signed.example.test/lesson-file?sig=abc';
const lesson = overrides => ({ id: 7, title: 'Breathing basics', lesson_type: 'audio', content_url: SIGNED, is_completed: false, ...overrides });

test.beforeEach(() => harness.reset());

// --- what is rendered ---------------------------------------------------------------------------------------------------

test('an audio lesson renders a keyboard-accessible player from the signed link, plus Mark as done', () => {
  const html = render(React.createElement(AudioLesson, { lesson: lesson(), programId: 5, reloadLesson() {} }));
  assert.match(html, /<audio controls="" preload="metadata" src="https:\/\/signed\.example\.test\/lesson-file\?sig=abc" aria-label="Audio: Breathing basics"/);
  assert.match(html, /Mark as done/);
  assert.doesNotMatch(html, /<video|<iframe|<object/);
});

test('an image lesson renders a responsive image with alt text that opens full size safely, plus Mark as done', () => {
  const html = render(React.createElement(ImageLesson, { lesson: lesson({ lesson_type: 'image', title: 'Posture diagram' }), programId: 5, reloadLesson() {} }));
  assert.match(html, /<img[^>]*src="https:\/\/signed\.example\.test\/lesson-file\?sig=abc"[^>]*alt="Posture diagram"/);
  assert.match(html, /class="[^"]*max-w-full[^"]*"/);
  assert.match(html, /<a href="https:\/\/signed\.example\.test\/lesson-file\?sig=abc" target="_blank" rel="noopener noreferrer" aria-label="Open “Posture diagram” at full size in a new tab"/);
  assert.match(html, /Mark as done/);
});

test('a completed lesson shows the Completed state instead of the button', () => {
  for (const [Component, type] of [[AudioLesson, 'audio'], [ImageLesson, 'image']]) {
    const html = render(React.createElement(Component, { lesson: lesson({ lesson_type: type, is_completed: true }), programId: 5, reloadLesson() {} }));
    assert.match(html, /Completed/, type);
    assert.doesNotMatch(html, /Mark as done/, type);
  }
});

test('a lesson without a file says so (and offers no player or image)', () => {
  const audio = render(React.createElement(AudioLesson, { lesson: lesson({ content_url: null }), programId: 5 }));
  assert.match(audio, /This audio isn&#x27;t available yet\./);
  assert.doesNotMatch(audio, /<audio/);
  const image = render(React.createElement(ImageLesson, { lesson: lesson({ lesson_type: 'image', content_url: null }), programId: 5 }));
  assert.match(image, /This image isn&#x27;t available yet\./);
  assert.doesNotMatch(image, /<img/);
});

test('the load-failure message has a 44px retry button and is announced as an alert', () => {
  const html = render(React.createElement(MediaLoadError, { what: 'audio', onRetry() {} }));
  assert.match(html, /role="alert"/);
  assert.match(html, /This audio couldn&#x27;t be loaded right now/);
  assert.match(html, /<button[^>]*min-h-\[44px\][^>]*>[\s\S]*Try again/);
});

// --- refresh once, then a retry button ---------------------------------------------------------------------------------------

const withReload = (behaviour = async () => {}) => {
  const calls = [];
  const reload = async () => { calls.push('reload'); return behaviour(calls.length); };
  return { calls, controller: createMediaRetry({ reload }) };
};

test('the first load failure refetches the lesson once and remounts the media', async () => {
  const { calls, controller } = withReload();
  const seen = [];
  controller.subscribe(() => seen.push(controller.getState().status));
  await controller.error();
  assert.deepEqual(calls, ['reload']);
  assert.deepEqual(seen, [MEDIA_STATUS.ok, MEDIA_STATUS.reloading, MEDIA_STATUS.ok]); // refreshing, then back with a new mount key
  assert.equal(controller.getState().status, MEDIA_STATUS.ok);
  assert.equal(controller.getState().attempt, 1);
});

test('a second failure does not refetch again: it shows the friendly error', async () => {
  const { calls, controller } = withReload();
  await controller.error();
  await controller.error();
  assert.equal(calls.length, 1); // retried exactly once
  assert.equal(controller.getState().status, MEDIA_STATUS.failed);
});

test('the retry button refreshes the lesson once more and remounts; a still-bad link ends on the error again', async () => {
  const { calls, controller } = withReload();
  await controller.error();
  await controller.error();
  await controller.retry();
  assert.equal(calls.length, 2);
  assert.equal(controller.getState().status, MEDIA_STATUS.ok);
  assert.equal(controller.getState().attempt, 2);
  await controller.error(); // still failing: no endless automatic retries
  assert.equal(calls.length, 2);
  assert.equal(controller.getState().status, MEDIA_STATUS.failed);
});

test('a failed refetch (offline) still ends cleanly on the retry button instead of looping', async () => {
  const { calls, controller } = withReload(async () => { throw new Error('offline'); });
  await controller.error();
  assert.equal(calls.length, 1);
  assert.equal(controller.getState().status, MEDIA_STATUS.ok);
  await controller.error();
  assert.equal(controller.getState().status, MEDIA_STATUS.failed);
});

test('errors reported while a refresh is already in progress are ignored', async () => {
  let release;
  const calls = [];
  const controller = createMediaRetry({ reload: () => { calls.push(1); return new Promise(resolve => { release = resolve; }); } });
  const first = controller.error();
  assert.equal(controller.getState().status, MEDIA_STATUS.reloading);
  await controller.error();
  await controller.retry();
  assert.equal(calls.length, 1);
  release();
  await first;
  assert.equal(controller.getState().status, MEDIA_STATUS.ok);
});

test('a successful load re-arms the automatic retry for a later expiry', async () => {
  const { calls, controller } = withReload();
  await controller.error();
  controller.loaded(); // the refreshed link worked
  await controller.error(); // an hour later it expires again
  assert.equal(calls.length, 2);
  assert.equal(controller.getState().status, MEDIA_STATUS.ok);
});

test('a load that succeeds first time never triggers a refetch', () => {
  const { calls, controller } = withReload();
  controller.loaded();
  assert.equal(calls.length, 0);
  assert.equal(controller.getState().status, MEDIA_STATUS.ok);
});
