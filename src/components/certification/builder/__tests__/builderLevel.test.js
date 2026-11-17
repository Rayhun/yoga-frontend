// Program Basics "Level": a select with the three levels the API accepts, and a hint (not an error) when a
// program still carries an older free-text value. Logic and server-rendered text only.
//
//   node -r sucrase/register -r ./src/components/certification/learner/__tests__/harness.cjs \
//        --test src/components/certification/builder/__tests__/
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
require('../../learner/__tests__/harness.cjs');

const { LEVEL_OPTIONS, legacyLevelHint, LegacyLevelHint } = require('../sections/basicsFolds');

test('the level options are Beginner, Intermediate, Advanced with lowercase API values, in that order', () => {
  assert.deepEqual(LEVEL_OPTIONS, [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ]);
});

test('no hint for blank or for one of the three levels, whatever its case or spacing', () => {
  for (const level of [null, undefined, '', '   ', 'beginner', 'Intermediate', ' ADVANCED ']) {
    assert.equal(legacyLevelHint(level), '', JSON.stringify(level));
  }
});

test('a legacy value gets a hint that names it and the three levels to pick from', () => {
  const hint = legacyLevelHint('  All levels ');
  assert.match(hint, /"All levels" is an older level value/);
  assert.match(hint, /Beginner, Intermediate or Advanced/);
});

test('the hint renders as a note for a legacy value and renders nothing otherwise', () => {
  const legacy = renderToStaticMarkup(React.createElement(LegacyLevelHint, { level: 'Everyone' }));
  assert.match(legacy, /role="note"/);
  assert.match(legacy, /&quot;Everyone&quot; is an older level value|"Everyone" is an older level value/);
  assert.equal(renderToStaticMarkup(React.createElement(LegacyLevelHint, { level: 'advanced' })), '');
  assert.equal(renderToStaticMarkup(React.createElement(LegacyLevelHint, { level: null })), '');
});

test('a legacy value is shown as stored: the hint text is escaped, never injected as HTML', () => {
  const html = renderToStaticMarkup(React.createElement(LegacyLevelHint, { level: '<b>x</b>' }));
  assert.doesNotMatch(html, /<b>/);
});
