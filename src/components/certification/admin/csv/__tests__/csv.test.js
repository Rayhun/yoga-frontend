// Flow tests for the admin Certification Applications Import / Export / Add New. Logic is tested directly
// (controller, services, pure helpers) and the markup is server-rendered with stubbed framework pieces
// (shared harness); NOTHING here checks appearance, real clicks, focus handling or a live API.
//
//   node -r sucrase/register -r ./src/components/certification/learner/__tests__/harness.cjs \
//        --test src/components/certification/admin/csv/__tests__/
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const harness = require('../../../learner/__tests__/harness.cjs');

const service = require('@/services/private/certification/applicationsCsv');
const transfer = require('../csvTransfer');
const { createImportController, IMPORT_STEPS } = require('../importController');
const { buildHeaderActions, createExportHandler } = require('../headerActions');
const { ImportDialogBody, IMPORT_NOTICE } = require('../ImportApplicationsDialog');
const { AddQteForm } = require('../AddQteModal');
const Table = require('../../ApplicationReviewTable').default;

const render = element => renderToStaticMarkup(element);
const csvFile = (overrides = {}) => ({ name: 'qte.csv', size: 1200, ...overrides });
const report = (overrides = {}) => ({
  total_rows: 4, updated: 2, unchanged: 1, skipped: 1,
  errors: [{ row: 5, email: 'ghost@example.com', field: null, code: 'not_found', message: 'No QTE application with this email.' }],
  ignored_columns: ['application_status'], unknown_columns: [], ...overrides,
});
const apiResponse = data => ({ data: { status: 'success', message: 'ok', data } });
const apiError = (status, body) => Object.assign(new Error(`status ${status}`), { response: { status, data: body } });

test.beforeEach(() => harness.reset());

// --- services: URLs and params -------------------------------------------------------------------------

test('export calls the export URL with the active tab as type, plus the status filter, as a blob', async () => {
  await service.exportApplications({ type: 'qte', status: 'submitted' });
  await service.exportApplications({ type: 'institution', status: 'approved' });
  await service.exportApplications({ type: 'qte' });
  const [qte, institution, noStatus] = harness.axiosCalls;
  assert.deepEqual(qte, { method: 'get', url: '/certification/admin/applications/export/', config: { params: { type: 'qte', status: 'submitted' }, responseType: 'blob' } });
  assert.deepEqual(institution.config.params, { type: 'institution', status: 'approved' });
  assert.deepEqual(noStatus.config.params, { type: 'qte' });
});

test('import posts multipart with type and file; dry_run only on the preview call', async () => {
  const file = new Blob(['email\n'], { type: 'text/csv' });
  await service.importApplications({ type: 'qte', file, dryRun: true });
  await service.importApplications({ type: 'institution', file });
  const [preview, real] = harness.axiosCalls;
  assert.equal(preview.url, '/certification/admin/applications/import/');
  assert.equal(preview.body.get('type'), 'qte');
  assert.equal(preview.body.get('dry_run'), 'true');
  assert.ok(preview.body.get('file'));
  assert.equal(real.body.get('type'), 'institution');
  assert.equal(real.body.get('dry_run'), null);
  assert.equal(preview.config.headers['Content-Type'], 'multipart/form-data');
});

test('create posts the body to the QTE create URL', async () => {
  await service.createQteApplication({ email: 'a@b.co', first_name: 'A', last_name: 'B' });
  assert.deepEqual(harness.axiosCalls[0], {
    method: 'post', url: '/certification/admin/applications/qte/', body: { email: 'a@b.co', first_name: 'A', last_name: 'B' }, config: undefined,
  });
});

// --- export handler -------------------------------------------------------------------------------------

test('the export handler requests the active tab with its status, shows loading, and downloads', async () => {
  const calls = [];
  const busy = [];
  const downloads = [];
  const run = createExportHandler({
    exportFn: async params => { calls.push(params); return { data: 'csv' }; },
    download: (response, name) => downloads.push([response.data, name]),
    onError: () => assert.fail('no error expected'),
    setBusy: value => busy.push(value),
  });
  assert.equal(await run({ type: 'institution', status: 'approved' }), true);
  assert.deepEqual(calls, [{ type: 'institution', status: 'approved' }]);
  assert.deepEqual(busy, [true, false]);
  assert.deepEqual(downloads, [['csv', 'certification_institution_applications.csv']]);
});

test('an export failure shows the error, downloads nothing and clears the loading state', async () => {
  const errors = [];
  const busy = [];
  const run = createExportHandler({
    exportFn: async () => { throw apiError(403, { message: 'nope' }); },
    download: () => assert.fail('must not download'),
    onError: error => errors.push(error.response.status),
    setBusy: value => busy.push(value),
  });
  assert.equal(await run({ type: 'qte', status: 'submitted' }), false);
  assert.deepEqual(errors, [403]);
  assert.deepEqual(busy, [true, false]);
});

// --- client-side file check ------------------------------------------------------------------------------

test('only a non-empty .csv up to 2 MB passes the client check', () => {
  assert.equal(transfer.validateCsvFile(csvFile()), null);
  assert.equal(transfer.validateCsvFile(csvFile({ name: 'DATA.CSV' })), null);
  assert.equal(transfer.validateCsvFile(csvFile({ size: 2 * 1024 * 1024 })), null);
  assert.match(transfer.validateCsvFile(csvFile({ size: 2 * 1024 * 1024 + 1 })), /larger than 2 MB/);
  assert.match(transfer.validateCsvFile(csvFile({ name: 'x.xlsx' })), /\.csv/);
  assert.match(transfer.validateCsvFile(csvFile({ name: 'csv' })), /\.csv/);
  assert.match(transfer.validateCsvFile(csvFile({ size: 0 })), /empty/);
  assert.match(transfer.validateCsvFile(null), /choose/);
});

// --- import flow: dry run first, real import only after confirmation ---------------------------------------

const controllerWith = ({ responses, onApplied } = {}) => {
  const calls = [];
  const queue = [...(responses || [apiResponse(report()), apiResponse(report({ errors: [] }))])];
  const importFn = async params => {
    calls.push(params);
    const next = queue.shift();
    if (next instanceof Error) throw next;
    return next;
  };
  return { calls, controller: createImportController({ importFn, type: 'qte', onApplied }) };
};

test('choosing a file runs a dry run only; the real import waits for confirmation', async () => {
  const { calls, controller } = controllerWith();
  const file = csvFile();
  await controller.chooseFile(file);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { type: 'qte', file, dryRun: true });
  assert.equal(controller.getState().step, IMPORT_STEPS.PREVIEW);
  assert.equal(controller.getState().preview.updated, 2);
  assert.equal(calls.filter(call => call.dryRun === false).length, 0); // nothing real yet
});

test('confirming runs the real import with the same file, reports it and never navigates', async () => {
  const applied = [];
  const { calls, controller } = controllerWith({ onApplied: result => applied.push(result) });
  const file = csvFile();
  await controller.chooseFile(file);
  await controller.confirm();
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], { type: 'qte', file, dryRun: false });
  assert.equal(controller.getState().step, IMPORT_STEPS.DONE);
  assert.equal(applied.length, 1);
  assert.equal(applied[0].updated, 2);
});

test('cancel at the select or preview step sends nothing more and a later confirm does nothing', async () => {
  const { calls, controller } = controllerWith();
  assert.equal(controller.cancel(), true); // before choosing anything
  await controller.chooseFile(csvFile());
  assert.equal(controller.cancel(), true);  // from the preview
  assert.equal(controller.getState().step, IMPORT_STEPS.SELECT);
  await controller.confirm();
  assert.equal(calls.length, 1);
  assert.equal(calls.some(call => call.dryRun === false), false);
});

test('a preview that arrives after cancel is ignored', async () => {
  let release;
  const importFn = () => new Promise(resolve => { release = resolve; });
  const controller = createImportController({ importFn, type: 'qte' });
  const pending = controller.chooseFile(csvFile());
  assert.equal(controller.getState().step, IMPORT_STEPS.PREVIEWING);
  controller.cancel();
  release(apiResponse(report()));
  await pending;
  assert.equal(controller.getState().step, IMPORT_STEPS.SELECT);
});

test('an invalid file never reaches the API', async () => {
  const { calls, controller } = controllerWith();
  await controller.chooseFile(csvFile({ name: 'x.xlsx' }));
  await controller.chooseFile(csvFile({ size: 3 * 1024 * 1024 }));
  assert.equal(calls.length, 0);
  assert.match(controller.getState().error, /larger than 2 MB/);
  assert.equal(controller.getState().step, IMPORT_STEPS.SELECT);
});

test('nothing to apply: confirm is a no-op when the preview would update zero rows', async () => {
  const { calls, controller } = controllerWith({ responses: [apiResponse(report({ updated: 0 }))] });
  await controller.chooseFile(csvFile());
  await controller.confirm();
  assert.equal(calls.length, 1);
  assert.equal(controller.getState().step, IMPORT_STEPS.PREVIEW);
});

test('failures: a dry-run error returns to select with the message; an apply error keeps the preview for a retry', async () => {
  const first = controllerWith({ responses: [apiError(400, { message: 'The file needs an "email" column.' })] });
  await first.controller.chooseFile(csvFile());
  assert.equal(first.controller.getState().step, IMPORT_STEPS.SELECT);
  assert.match(first.controller.getState().error, /email/);

  const second = controllerWith({ responses: [apiResponse(report()), apiError(500, { message: 'Server down' }), apiResponse(report({ errors: [] }))] });
  await second.controller.chooseFile(csvFile());
  await second.controller.confirm();
  assert.equal(second.controller.getState().step, IMPORT_STEPS.PREVIEW);
  assert.match(second.controller.getState().error, /Server down/);
  await second.controller.confirm(); // retry works
  assert.equal(second.controller.getState().step, IMPORT_STEPS.DONE);
});

test('cancel is refused while the real import is in flight', async () => {
  let release;
  const calls = [];
  const importFn = params => {
    calls.push(params);
    return params.dryRun ? Promise.resolve(apiResponse(report())) : new Promise(resolve => { release = resolve; });
  };
  const controller = createImportController({ importFn, type: 'qte' });
  await controller.chooseFile(csvFile());
  const applying = controller.confirm();
  assert.equal(controller.getState().step, IMPORT_STEPS.APPLYING);
  assert.equal(controller.cancel(), false);
  release(apiResponse(report({ errors: [] })));
  await applying;
  assert.equal(controller.getState().step, IMPORT_STEPS.DONE);
});

// --- import dialog markup ---------------------------------------------------------------------------------

const body = state => render(React.createElement(ImportDialogBody, { state, tabLabel: 'QTE', onFile() {}, onConfirm() {}, onCancel() {} }));
const base = { step: 'select', file: null, preview: null, result: null, error: null };

test('the dialog always says import only updates existing records and never creates accounts or changes passwords', () => {
  for (const step of ['select', 'previewing', 'applying']) assert.match(body({ ...base, step }), /never creates accounts or changes passwords/);
  assert.match(IMPORT_NOTICE, /only updates existing records matched by email/);
});

test('select step: a labelled file input that accepts .csv', () => {
  const html = body(base);
  assert.match(html, /<label for="application-import-file"[^>]*>QTE CSV file \(\.csv, up to 2 MB\)<\/label>/);
  assert.match(html, /<input id="application-import-file" type="file" accept="\.csv,text\/csv"/);
});

test('preview step: summary, the error list (row, email, message) and an Apply button', () => {
  const summary = transfer.summarizeImport(report({ errors: [
    { row: 5, email: 'ghost@example.com', field: null, code: 'not_found', message: 'No QTE application with this email.' },
    { row: 7, email: 'jo@example.com', field: 'sample_lecture_link', code: 'invalid_value', message: 'Must be a valid http(s) URL.' },
  ] }));
  const html = body({ ...base, step: 'preview', file: csvFile(), preview: summary });
  assert.match(html, /Nothing has been saved yet/);
  assert.match(html, /<strong>2<\/strong> rows will be updated/);
  assert.match(html, /<strong>1<\/strong> unchanged/);
  assert.match(html, /<strong>2<\/strong> rows have errors and will be skipped/);
  assert.match(html, /<td class="p-2">5<\/td><td class="p-2 break-all">ghost@example\.com<\/td><td class="p-2">No QTE application with this email\.<\/td>/);
  assert.match(html, /sample_lecture_link: Must be a valid http\(s\) URL\./);
  assert.match(html, /Apply 2 updates/);
  assert.ok(html.includes('min-h-[44px]'));
});

test('preview with nothing to update disables Apply; preview without errors shows no error table', () => {
  const html = body({ ...base, step: 'preview', file: csvFile(), preview: transfer.summarizeImport(report({ updated: 0, errors: [] })) });
  assert.match(html, /Nothing to apply/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>[\s\S]*?Nothing to apply/);
  assert.doesNotMatch(html, /data-testid="import-errors"/);
});

test('applying disables Cancel; done shows the result and a Close button', () => {
  const applying = body({ ...base, step: 'applying', file: csvFile(), preview: transfer.summarizeImport(report()) });
  assert.match(applying, /Applying changes/);
  assert.match(applying, /<button[^>]*disabled=""[^>]*>[\s\S]*?Cancel/);
  const done = body({ ...base, step: 'done', result: transfer.summarizeImport(report({ errors: [] })) });
  assert.match(done, /Import finished/);
  assert.match(done, /Close/);
  assert.doesNotMatch(done, />Cancel</);
});

// --- header buttons ---------------------------------------------------------------------------------------------

test('admin on the QTE tab gets Import, Export and Add New, all at least 44px tall', () => {
  const actions = buildHeaderActions({ isAdmin: true, tabKey: 'qte', isExporting: false, onImport() {}, onExport() {}, onAddNew() {} });
  assert.deepEqual(actions.map(action => action.label), ['Import', 'Export', 'Add New']);
  assert.ok(actions.every(action => action.className.includes('min-h-[44px]')));
});

test('Add New is hidden on the Institution tab (no admin create flow exists there)', () => {
  const actions = buildHeaderActions({ isAdmin: true, tabKey: 'institution', isExporting: false, onImport() {}, onExport() {}, onAddNew() {} });
  assert.deepEqual(actions.map(action => action.id), ['import', 'export']);
});

test('a non-admin (Staff included) sees no buttons at all', () => {
  assert.deepEqual(buildHeaderActions({ isAdmin: false, tabKey: 'qte', onImport() {}, onExport() {}, onAddNew() {} }), []);
  assert.deepEqual(buildHeaderActions({ isAdmin: undefined, tabKey: 'institution' }), []);
});

test('the export button shows a loading state while exporting', () => {
  const actions = buildHeaderActions({ isAdmin: true, tabKey: 'qte', isExporting: true, onImport() {}, onExport() {}, onAddNew() {} });
  assert.equal(actions.find(action => action.id === 'export').isLoading, true);
});

test('the table renders the three buttons for an admin on the default QTE tab, and none for a non-admin', () => {
  harness.user = { isAdmin: true };
  const admin = render(React.createElement(Table));
  for (const label of ['Import', 'Export', 'Add New']) assert.match(admin, new RegExp(`<span>${label}</span>`));
  harness.user = { isAdmin: false, isStaff: true };
  const staff = render(React.createElement(Table));
  for (const label of ['Import', 'Export', 'Add New']) assert.doesNotMatch(staff, new RegExp(`<span>${label}</span>`));
  assert.match(staff, /Certification Applications/);
});

test('the table offers a Draft filter so a newly created record can be seen', () => {
  harness.user = { isAdmin: true };
  assert.match(render(React.createElement(Table)), /draft/);
});

// --- Add New -----------------------------------------------------------------------------------------------------

const created = (overrides = {}) => ({
  data: { id: 99, first_name: 'Nia', last_name: 'Okoro', email: 'nia@example.com', application_status: 'draft', creator_type: 'qte',
    email_sent: true, message: 'QTE record created. An email was sent so they can set their password.', ...overrides },
});

test('Add New success returns the table row without the email flags and adds it to the cached list', async () => {
  const sent = [];
  const result = await transfer.submitNewQte({
    createFn: async payload => { sent.push(payload); return created(); },
    values: { email: ' nia@example.com ', first_name: 'Nia ', last_name: 'Okoro', legal_name: '', public_name: 'Coach Nia', country: '', timezone: '' },
  });
  assert.equal(result.ok, true);
  assert.deepEqual(sent, [{ email: 'nia@example.com', first_name: 'Nia', last_name: 'Okoro', public_name: 'Coach Nia' }]); // trimmed, blanks left out
  assert.equal(result.emailSent, true);
  assert.equal(result.row.id, 99);
  assert.ok(!('email_sent' in result.row) && !('message' in result.row));

  const cached = { data: [{ id: 1, email: 'old@example.com' }], status: 200 };
  const next = transfer.addRowToCache(cached, result.row);
  assert.deepEqual(next.data.map(row => row.id), [99, 1]);
  assert.equal(next.status, 200);
  assert.deepEqual(transfer.addRowToCache(next, result.row).data.map(row => row.id), [99, 1]); // no duplicate
  assert.equal(transfer.addRowToCache(undefined, result.row), undefined); // nothing cached yet: the refetch will include it
});

test('email_sent=false keeps the record and carries the backend warning message', async () => {
  const warning = 'The record was created, but the invitation email could not be sent. Ask the person to use "Forgot password".';
  const result = await transfer.submitNewQte({
    createFn: async () => created({ email_sent: false, message: warning }),
    values: { email: 'nia@example.com', first_name: 'Nia', last_name: 'Okoro' },
  });
  assert.deepEqual([result.ok, result.emailSent, result.message], [true, false, warning]);
  assert.equal(result.row.id, 99);
});

test('400 validation errors become per-field messages; a duplicate email lands on the email field', async () => {
  const validation = await transfer.submitNewQte({
    createFn: async () => { throw apiError(400, { status: 'error', message: 'Validation failed.', data: { email: ['Enter a valid email address.'], last_name: ['This field may not be blank.'] } }); },
    values: { email: 'x', first_name: 'N', last_name: '' },
  });
  assert.equal(validation.ok, false);
  assert.deepEqual(validation.fieldErrors, { email: 'Enter a valid email address.', last_name: 'This field may not be blank.' });

  const duplicate = await transfer.submitNewQte({
    createFn: async () => { throw apiError(400, { status: 'error', message: 'An account already exists with this email address.', data: '' }); },
    values: { email: 'dup@example.com', first_name: 'N', last_name: 'O' },
  });
  assert.deepEqual(duplicate.fieldErrors, { email: 'An account already exists with this email address.' });

  const server = await transfer.submitNewQte({ createFn: async () => { throw apiError(500, { message: 'Boom' }); }, values: { email: 'a@b.co', first_name: 'N', last_name: 'O' } });
  assert.deepEqual([server.ok, server.fieldErrors], [false, {}]);
  assert.match(server.message, /Boom/);
});

test('the Add New form has required and optional sections of at most six inputs each', () => {
  const html = render(React.createElement(AddQteForm, { onSubmit: async () => ({ ok: true }), onClose() {} }));
  const sections = html.split('<fieldset').slice(1);
  assert.equal(sections.length, 2);
  assert.deepEqual(sections.map(section => (section.match(/<input /g) || []).length), [3, 4]);
  assert.ok(sections.every(section => (section.match(/<input /g) || []).length <= 6));
  for (const label of ['Email', 'First name', 'Last name', 'Legal name', 'Public name', 'Country', 'Timezone']) assert.match(html, new RegExp(`>${label}<`));
  assert.match(html, /<legend[^>]*>Required<\/legend>/);
  assert.match(html, /min-h-\[44px\]/);
});

test('server field errors render under their fields', () => {
  const html = render(React.createElement(AddQteForm, {
    onSubmit: async () => ({ ok: true }), onClose() {},
    initialErrors: { email: 'An account already exists with this email address.', last_name: 'This field may not be blank.' },
  }));
  assert.match(html, /An account already exists with this email address\./);
  assert.match(html, /This field may not be blank\./);
});
