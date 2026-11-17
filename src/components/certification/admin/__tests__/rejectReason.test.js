// Disapprove Application modal: the validation rules, the request payload and the rendered form. Logic and
// server-rendered markup only — the modal was not looked at in a browser. The category list is served by the
// backend; FIXTURE below is what Certification/rejection_reasons.py returns (the last test reads that file when the
// backend repo sits next to this one, so the labels cannot drift unnoticed).
//
//   node -r sucrase/register -r ./src/components/certification/learner/__tests__/harness.cjs \
//        --test src/components/certification/admin/__tests__/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const harness = require('../../learner/__tests__/harness.cjs');

const model = require('../rejectReasonModel');
const RejectReasonForm = require('../RejectReasonForm').default;
const applications = require('../../../../services/private/certification/applications');

const CLIENT_LABELS = [
  'Identity & Verification Issues',
  'Credential & Accreditation Standards',
  'Content Strategy & Market Alignment',
  'Technical & Production Capabilities',
  'Policy & Security Violations',
  'Other / Reason Not Listed',
];
const KEYS = ['identity_verification', 'credential_accreditation', 'content_strategy', 'technical_production', 'policy_security', 'other'];
const FIXTURE = {
  categories: KEYS.map((key, index) => ({ key, label: CLIENT_LABELS[index] })),
  other_key: 'other',
  details_max_length: 1000,
};
const values = (reason_category = '', reason_details = '') => ({ reason_category, reason_details });
const errorsOf = (...args) => model.getRejectFormErrors(values(...args), FIXTURE);

// --- validation rules ---------------------------------------------------------------------------------------

test('a category is required', () => {
  assert.deepEqual(Object.keys(errorsOf('')), ['reason_category']);
  assert.deepEqual(Object.keys(errorsOf('', 'details but no category')), ['reason_category']);
  assert.equal(errorsOf('', '').reason_category, 'Select a reason');
});

test('a value that is not one of the backend categories is refused (a label is not a key)', () => {
  assert.ok(errorsOf('nope').reason_category);
  assert.ok(errorsOf('Identity & Verification Issues').reason_category);
});

test('every listed category is valid without details, except Other', () => {
  KEYS.filter(key => key !== 'other').forEach(key => assert.deepEqual(errorsOf(key), {}, key));
});

test('Other needs details (whitespace does not count); the other categories do not', () => {
  assert.ok(errorsOf('other').reason_details);
  assert.ok(errorsOf('other', '   \n ').reason_details);
  assert.deepEqual(errorsOf('other', 'Please resubmit'), {});
  assert.deepEqual(errorsOf('policy_security', ''), {});
  assert.deepEqual(errorsOf('policy_security', 'optional note'), {});
});

test('details are limited to the backend maximum (1000), counted after trimming', () => {
  assert.deepEqual(errorsOf('content_strategy', 'a'.repeat(1000)), {});
  assert.ok(errorsOf('content_strategy', 'a'.repeat(1001)).reason_details);
  assert.deepEqual(errorsOf('content_strategy', `  ${'a'.repeat(1000)}  `), {});
  assert.deepEqual(model.getRejectFormErrors(values('content_strategy', 'a'.repeat(11)), { ...FIXTURE, details_max_length: 10 }), {
    reason_details: 'Must be at most 10 characters',
  });
});

test('the form is invalid until the config has loaded', () => {
  assert.equal(model.isRejectFormValid(values('content_strategy'), undefined), false);
  assert.equal(model.isRejectFormValid(values('content_strategy'), FIXTURE), true);
  assert.equal(model.isRejectFormValid(values(''), FIXTURE), false);
  assert.equal(model.isRejectFormValid(values('other'), FIXTURE), false);
  assert.equal(model.isRejectFormValid(values('other', 'why'), FIXTURE), true);
});

test('the details label says "required for Other" only once Other is chosen', () => {
  assert.equal(model.getDetailsLabel(values('content_strategy'), FIXTURE), 'Details');
  assert.equal(model.getDetailsLabel(values(''), FIXTURE), 'Details');
  assert.equal(model.getDetailsLabel(values('other'), FIXTURE), 'Details (required for Other)');
});

// --- request payload ------------------------------------------------------------------------------------------

test('the payload is { reason_category, reason_details? } with details trimmed and omitted when empty', () => {
  assert.deepEqual(model.buildRejectPayload(values('identity_verification')), { reason_category: 'identity_verification' });
  assert.deepEqual(model.buildRejectPayload(values('identity_verification', '   ')), { reason_category: 'identity_verification' });
  assert.deepEqual(model.buildRejectPayload(values('other', '  Please resubmit ')), { reason_category: 'other', reason_details: 'Please resubmit' });
  assert.ok(!('rejected_reason' in model.buildRejectPayload(values('other', 'x'))), 'the old free-text field is gone');
});

test('the service posts that payload to the reject URL of the right application type, and reads the list from the backend', async () => {
  harness.axiosCalls.length = 0;
  const payload = model.buildRejectPayload(values('other', 'Please resubmit'));
  await applications.rejectApplication({ type: 'expert', id: 7, payload });
  await applications.rejectApplication({ type: 'institution', id: 9, payload: model.buildRejectPayload(values('content_strategy')) });
  await applications.getRejectionReasons();
  const [qte, institution, list] = harness.axiosCalls;
  assert.deepEqual([qte.method, qte.url, qte.body], ['post', '/certification/admin/applications/expert/7/reject/', { reason_category: 'other', reason_details: 'Please resubmit' }]);
  assert.deepEqual([institution.method, institution.url, institution.body], ['post', '/certification/admin/applications/institution/9/reject/', { reason_category: 'content_strategy' }]);
  assert.deepEqual([list.method, list.url], ['get', '/certification/admin/applications/rejection-reasons/']);
});

// --- the rendered form ----------------------------------------------------------------------------------------

const render = props => renderToStaticMarkup(React.createElement(RejectReasonForm, { config: FIXTURE, onSubmit: () => {}, onClose: () => {}, ...props }));
// The `disabled` ATTRIBUTE (React renders it as disabled=""); the Tailwind classes also contain the text "disabled:".
const disapproveDisabled = html => /<button[^>]*type="submit"[^>]*\sdisabled=""|<button[^>]*\sdisabled=""[^>]*type="submit"/.test(html);

test('the Reason select lists the six labels in the client order, after a placeholder', () => {
  const html = render();
  const options = [...html.matchAll(/<option[^>]*value="([^"]*)"[^>]*>([^<]*)<\/option>/g)].map(match => [match[1], match[2].replace(/&amp;/g, '&')]);
  assert.deepEqual(options, [['', 'Select a reason'], ...FIXTURE.categories.map(category => [category.key, category.label])]);
  assert.deepEqual(options.slice(1).map(option => option[1]), CLIENT_LABELS);
  assert.match(html, /<select[^>]*name="reason_category"/);
  assert.ok(html.includes('Reason'));
  assert.ok(html.includes('Details'));
});

test('Disapprove is disabled until the form is valid', () => {
  assert.ok(disapproveDisabled(render()), 'nothing chosen');
  assert.ok(disapproveDisabled(render({ initialValues: values('other', '') })), 'Other without details');
  assert.ok(!disapproveDisabled(render({ initialValues: values('other', 'Please resubmit') })), 'Other with details');
  assert.ok(!disapproveDisabled(render({ initialValues: values('policy_security', '') })), 'a category alone');
  assert.ok(disapproveDisabled(render({ initialValues: values('policy_security', 'a'.repeat(1001)) })), 'details too long');
  assert.ok(disapproveDisabled(render({ config: undefined, isLoading: true, initialValues: values('policy_security') })), 'reasons still loading');
});

test('choosing Other relabels and marks the details field as required', () => {
  const plain = render({ initialValues: values('policy_security') });
  assert.ok(!plain.includes('required for Other'));
  const other = render({ initialValues: values('other') });
  assert.ok(other.includes('Details (required for Other)'));
});

test('while the reasons load the select is disabled and says so; a load failure is announced', () => {
  const loading = render({ config: undefined, isLoading: true });
  assert.match(loading, /<select[^>]*\sdisabled=""/);
  assert.doesNotMatch(render(), /<select[^>]*\sdisabled=""/, 'enabled once the reasons have loaded');
  assert.ok(loading.includes('Loading reasons'));
  const failed = render({ config: undefined, loadError: true });
  assert.ok(failed.includes('role="alert"'));
  assert.ok(failed.includes('could not be loaded'));
});

test('the details counter shows the length against the backend limit', () => {
  assert.ok(render({ initialValues: values('policy_security', 'abc') }).includes('3/1000'));
});

// --- labels match the backend list ----------------------------------------------------------------------------

test('the labels and order match Certification/rejection_reasons.py (when the backend repo is alongside)', t => {
  const file = path.resolve(__dirname, '../../../../../../BACKEND2026/Certification/rejection_reasons.py');
  if (!fs.existsSync(file)) return t.skip('BACKEND2026 is not next to FRONTEND2026');
  const source = fs.readFileSync(file, 'utf8');
  const block = /REJECTION_CATEGORIES = \(([\s\S]*?)\n\)/.exec(source)[1];
  const pairs = [...block.matchAll(/\('([a-z_]+)',\s*'([^']+)'\)/g)].map(match => [match[1], match[2]]);
  assert.deepEqual(pairs, FIXTURE.categories.map(category => [category.key, category.label]));
  assert.equal(Number(/MAX_DETAILS_LENGTH = (\d+)/.exec(source)[1]), FIXTURE.details_max_length);
});
