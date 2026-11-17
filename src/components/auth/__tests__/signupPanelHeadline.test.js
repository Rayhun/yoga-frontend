// QTE signup left panel headline: two separate block lines — orange "Bring Your Programs to the World." then
// dark "Certify Wellness Leaders." on one line (no wrap from the `lg` breakpoint, where the panel first shows).
// Server-rendered markup only; the real layout (1024 / 1280 / 1440px) was not looked at in a browser.
//
//   node -r sucrase/register -r ./src/components/certification/learner/__tests__/harness.cjs \
//        --test src/components/auth/__tests__/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
require('../../certification/learner/__tests__/harness.cjs');

const SignupPanelHeadline = require('../SignupPanelHeadline').default;
const { QTE_PANEL_COPY } = require('../signupPanelCopy');

const render = props => renderToStaticMarkup(React.createElement(SignupPanelHeadline, props));
const qte = () => render({ accent: QTE_PANEL_COPY.headlineAccent, rest: QTE_PANEL_COPY.headlineRest, stacked: true });

test('QTE copy is the client wording', () => {
  assert.equal(QTE_PANEL_COPY.headlineAccent, 'Bring Your Programs to the World.');
  assert.equal(QTE_PANEL_COPY.headlineRest, 'Certify Wellness Leaders.');
});

test('stacked: two separate block lines with the right text and colours', () => {
  const html = qte();
  const lines = [...html.matchAll(/<span([^>]*)data-headline-line="(accent|rest)"([^>]*)>([^<]*)<\/span>/g)];
  assert.equal(lines.length, 2);
  const [accent, rest] = lines;
  assert.equal(accent[2], 'accent');
  assert.equal(accent[4], 'Bring Your Programs to the World.');
  assert.match(accent[1] + accent[3], /\bblock\b/);
  assert.match(accent[1] + accent[3], /text-orange-600/);
  assert.equal(rest[2], 'rest');
  assert.equal(rest[4], 'Certify Wellness Leaders.');
  assert.match(rest[1] + rest[3], /\bblock\b/);
  assert.match(rest[1] + rest[3], /text-gray-800/);
  assert.ok(accent.index < rest.index, 'orange line first, dark line second');
});

test('stacked: the dark line never wraps from lg up, the orange one may; the phrases are not in one inline run', () => {
  const html = qte();
  assert.match(html, /data-headline-line="rest"[^>]*lg:whitespace-nowrap|lg:whitespace-nowrap[^>]*data-headline-line="rest"/);
  assert.ok(!/data-headline-line="accent"[^>]*whitespace-nowrap/.test(html), 'the long orange line is allowed to wrap');
  assert.ok(!html.includes('</span> Certify'), 'no inline space joining the two phrases on one line');
});

test('stacked: font size steps down for the 1024px column and tracking is tight', () => {
  const html = qte();
  assert.match(html, /text-\[1\.75rem\]/);
  assert.match(html, /xl:text-\[2rem\]/);
  assert.match(html, /tracking-tight/);
  assert.ok(!html.includes('text-4xl'), 'text-4xl (36px) does not fit the 1024px column on one line');
});

test('default / expert copy keep the original single inline headline', () => {
  const html = render({ accent: 'Your Wellness Journey', rest: 'Starts Here.' });
  assert.ok(html.includes('text-4xl'));
  assert.ok(html.includes('Your Wellness Journey</span> Starts Here.'));
  assert.ok(!html.includes('data-headline-line'));
});

test('both signup pages use the shared headline and only stack it for the QTE copy', () => {
  const root = path.resolve(__dirname, '../../../app/auth');
  ['signup/page.jsx', 'expert/signup/page.jsx'].forEach(file => {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.ok(source.includes("import SignupPanelHeadline from '@/components/auth/SignupPanelHeadline'"), file);
    assert.ok(source.includes('stacked={isQteSignup(searchParams)}'), file);
    assert.ok(!source.includes('<h1 className="text-4xl'), `${file} still has the old inline headline`);
  });
});
