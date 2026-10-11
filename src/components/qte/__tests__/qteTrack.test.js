// Flow tests for the QTE-track onboarding: who is locked / unlocked, what each state renders, where Expert-only
// URLs go, the two-section application step, the device-only draft and the sidebar. Server-rendered with the
// shared stub harness: they check markup text and logic, NOT appearance (nothing was looked at in a browser).
//
//   node -r sucrase/register -r ./src/components/certification/learner/__tests__/harness.cjs \
//        --test src/components/qte/__tests__/
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { Formik } = require('formik');
const harness = require('../../certification/learner/__tests__/harness.cjs');

// Spies for the Expert dashboard: if it ever renders (or its API is requested) for a QTE user, these show it.
const spy = { expertDashboardRenders: 0, expertDashboardRequests: 0 };
const stubs = {
  '@/components/expert/HomeDashboard': {
    __esModule: true,
    default: () => {
      spy.expertDashboardRenders += 1;
      return React.createElement('div', null, 'EXPERT-DASHBOARD');
    },
  },
  '@/components/certification/apply/TeacherQTEStatusBanner': { __esModule: true, default: () => null },
  '@/services/private/expert/dashboard': {
    getExpertHomeDashboard: () => {
      spy.expertDashboardRequests += 1;
      return Object.assign(Promise.resolve(), { __result: { data: { data: { marker: 1 } } } });
    },
  },
};
const previousLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (Object.prototype.hasOwnProperty.call(stubs, request)) return stubs[request];
  return previousLoad.apply(this, arguments);
};

const { getQteTrackState, resolveTeacherRoute, getQtePortalTarget, QTE_VIEW } = require('../../../utils/qteTrack');
const QteTrackGuard = require('../QteTrackGuard').default;
const QteDashboard = require('../QteDashboard').default;
const DashboardPage = require('../../../app/portal/teacher/dashboard/page').default;
const SIDEBAR = require('../../../utils/sidebar').default;
const qteApp = require('../../lms/expert/qteApplication');
const QteApplicationStep = require('../../lms/expert/QteApplicationStep').default;
const useApprovedQTE = require('../../../hooks/useApprovedQTE').default;

const STATUSES = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'suspended'];
const teacher = (creator_type, application_status, extra = {}) => ({
  role: 'Teacher', creator_type, application_status, rejected_reason: null, ...extra,
});
const setProfile = profile => {
  harness.reset();
  harness.pathname = null;
  harness.user = { profile };
};

// --- the status table ----------------------------------------------------------------------------------------

test('qte x status: draft is the only locked state, suspended is its own view, everything else is unlocked', () => {
  const expected = {
    draft: QTE_VIEW.LOCKED, submitted: QTE_VIEW.UNLOCKED, under_review: QTE_VIEW.UNLOCKED,
    approved: QTE_VIEW.UNLOCKED, rejected: QTE_VIEW.UNLOCKED, suspended: QTE_VIEW.SUSPENDED,
  };
  STATUSES.forEach(status => {
    const state = getQteTrackState(teacher('qte', status));
    assert.equal(state.view, expected[status], status);
    assert.equal(state.isQteTrack, true, status);
    assert.equal(state.isApproved, status === 'approved', status);
  });
});

test('a plain expert reporting application_status "draft" is NOT locked — status is read only for creator_type qte', () => {
  STATUSES.forEach(status => {
    const state = getQteTrackState(teacher('expert', status));
    assert.equal(state.view, QTE_VIEW.NOT_QTE, status);
    assert.equal(state.isQteTrack, false);
    assert.equal(state.applicationStatus, null);
  });
  assert.equal(getQteTrackState(teacher(null, null)).view, QTE_VIEW.NOT_QTE); // Teacher without an Expert row
});

test('other roles are never QTE-track, even if a stray creator_type came along', () => {
  ['Customer', 'Institution', 'Admin', 'Staff', 'Affiliate'].forEach(role => {
    assert.equal(getQteTrackState({ role, creator_type: 'qte', application_status: 'draft' }).view, QTE_VIEW.NOT_QTE, role);
  });
});

test('no profile yet -> loading (nothing role-specific may render)', () => {
  assert.equal(getQteTrackState(null).view, QTE_VIEW.LOADING);
  assert.equal(getQteTrackState({}).view, QTE_VIEW.LOADING);
  assert.equal(getQteTrackState({ role: null }).isLoading, true);
});

test('the rejection reason is only carried while rejected', () => {
  assert.equal(getQteTrackState(teacher('qte', 'rejected', { rejected_reason: 'Add certificates' })).rejectedReason, 'Add certificates');
  assert.equal(getQteTrackState(teacher('qte', 'approved', { rejected_reason: 'old reason' })).rejectedReason, '');
});

// --- Expert-only URL redirects -------------------------------------------------------------------------------

const EXPERT_ONLY = [
  '/portal/teacher/group_coaching/add', '/portal/teacher/consultation/list', '/portal/teacher/program/3',
  '/portal/teacher/referrals', '/portal/teacher/wellness-insights',
];

test('a QTE-track user on an Expert-only URL is redirected (unlocked -> QTE dashboard, draft -> wizard, suspended -> dashboard)', () => {
  const to = {
    draft: '/portal/teacher/editProfile', submitted: '/portal/teacher/dashboard', under_review: '/portal/teacher/dashboard',
    approved: '/portal/teacher/dashboard', rejected: '/portal/teacher/dashboard', suspended: '/portal/teacher/dashboard',
  };
  STATUSES.forEach(status => {
    EXPERT_ONLY.forEach(path => {
      assert.deepEqual(resolveTeacherRoute(path, getQteTrackState(teacher('qte', status))), { action: 'redirect', to: to[status] }, `${status} ${path}`);
    });
  });
});

test('normal experts (even with status "draft"), learners and institutions are never redirected', () => {
  [teacher('expert', 'draft'), teacher(null, null), { role: 'Customer' }, { role: 'Institution' }, { role: 'Admin' }].forEach(profile => {
    EXPERT_ONLY.concat('/portal/teacher/dashboard', '/portal/teacher/apply-qte').forEach(path => {
      assert.deepEqual(resolveTeacherRoute(path, getQteTrackState(profile)), { action: 'allow' }, `${profile.role} ${path}`);
    });
  });
});

test('the QTE portal pages stay open to unlocked QTE users; a draft user only gets the wizard and the profile', () => {
  const open = ['/portal/teacher/dashboard', '/portal/teacher/certification/programs', '/portal/teacher/certification/grading',
    '/portal/teacher/payments', '/portal/teacher/community/create', '/portal/teacher/profile', '/portal/teacher/editProfile'];
  const approved = getQteTrackState(teacher('qte', 'approved'));
  open.forEach(path => assert.equal(resolveTeacherRoute(path, approved).action, 'allow', path));

  const draft = getQteTrackState(teacher('qte', 'draft'));
  ['/portal/teacher/editProfile', '/portal/teacher/profile'].forEach(path => assert.equal(resolveTeacherRoute(path, draft).action, 'allow', path));
  ['/portal/teacher/dashboard', '/portal/teacher/certification/programs', '/portal/teacher/payments', '/portal/teacher/apply-qte'].forEach(path =>
    assert.deepEqual(resolveTeacherRoute(path, draft), { action: 'redirect', to: '/portal/teacher/editProfile' }, path)
  );

  const suspended = getQteTrackState(teacher('qte', 'suspended'));
  assert.equal(resolveTeacherRoute('/portal/teacher/dashboard', suspended).action, 'allow');
  assert.equal(resolveTeacherRoute('/portal/teacher/certification/programs', suspended).action, 'redirect');
});

test('the old apply page: rejected re-applies in the wizard (prefilled), in-flight users go to the dashboard', () => {
  assert.deepEqual(resolveTeacherRoute('/portal/teacher/apply-qte', getQteTrackState(teacher('qte', 'rejected'))),
    { action: 'redirect', to: '/portal/teacher/editProfile?reapply=1' });
  assert.deepEqual(resolveTeacherRoute('/portal/teacher/apply-qte', getQteTrackState(teacher('qte', 'submitted'))),
    { action: 'redirect', to: '/portal/teacher/dashboard' });
});

test('/portal sends a QTE-track Teacher to the wizard (draft) or the QTE dashboard — never the Expert screens', () => {
  assert.equal(getQtePortalTarget(getQteTrackState(teacher('qte', 'draft'))), '/portal/teacher/editProfile');
  ['submitted', 'under_review', 'approved', 'rejected', 'suspended'].forEach(status =>
    assert.equal(getQtePortalTarget(getQteTrackState(teacher('qte', status))), '/portal/teacher/dashboard', status));
  assert.equal(getQtePortalTarget(getQteTrackState(teacher('expert', 'draft'))), null);
});

// --- the guard and the dashboard page, rendered --------------------------------------------------------------

const renderGuard = (profile, pathname) => {
  setProfile(profile);
  harness.pathname = pathname;
  return renderToStaticMarkup(React.createElement(QteTrackGuard, null, React.createElement('div', null, 'PAGE-BODY')));
};

test('the guard renders no page before the profile is loaded, and none for a QTE user on an Expert-only URL', () => {
  assert.doesNotMatch(renderGuard({}, '/portal/teacher/dashboard'), /PAGE-BODY/);
  assert.doesNotMatch(renderGuard(teacher('qte', 'approved'), '/portal/teacher/group_coaching/add'), /PAGE-BODY/);
  assert.doesNotMatch(renderGuard(teacher('qte', 'draft'), '/portal/teacher/dashboard'), /PAGE-BODY/);
  assert.match(renderGuard(teacher('qte', 'approved'), '/portal/teacher/certification/programs'), /PAGE-BODY/);
  assert.match(renderGuard(teacher('expert', 'draft'), '/portal/teacher/group_coaching/add'), /PAGE-BODY/);
  assert.match(renderGuard({ role: 'Customer' }, '/portal/teacher/group_coaching/add'), /PAGE-BODY/);
});

const renderDashboardPage = profile => {
  setProfile(profile);
  spy.expertDashboardRenders = 0;
  spy.expertDashboardRequests = 0;
  return renderToStaticMarkup(React.createElement(DashboardPage));
};

test('a QTE user never renders the Expert dashboard nor requests its API — in any status, or before the profile loads', () => {
  STATUSES.forEach(status => {
    const html = renderDashboardPage(teacher('qte', status));
    assert.doesNotMatch(html, /EXPERT-DASHBOARD/, status);
    assert.equal(spy.expertDashboardRenders, 0, status);
    assert.equal(spy.expertDashboardRequests, 0, `${status}: the Expert dashboard API was requested`);
  });
  // profile not loaded yet: still no Expert dashboard, still no request
  const loading = renderDashboardPage({});
  assert.doesNotMatch(loading, /EXPERT-DASHBOARD/);
  assert.equal(spy.expertDashboardRequests, 0);
});

test('a plain expert (status "draft") still gets the Expert dashboard, as before', () => {
  const html = renderDashboardPage(teacher('expert', 'draft'));
  assert.match(html, /EXPERT-DASHBOARD/);
  assert.equal(spy.expertDashboardRequests, 1);
});

// --- what the QTE dashboard shows ----------------------------------------------------------------------------

const renderQteDashboard = (status, extra = {}) => {
  setProfile(teacher('qte', status, extra));
  return renderToStaticMarkup(React.createElement(QteDashboard));
};

test('draft: no dashboard content (the guard sends it to the wizard)', () => {
  const html = renderQteDashboard('draft');
  assert.doesNotMatch(html, /QTE Dashboard/);
});

test('submitted / under_review: unlocked with an "under review" card, tools shown as unavailable', () => {
  ['submitted', 'under_review'].forEach(status => {
    const html = renderQteDashboard(status);
    assert.match(html, /QTE Dashboard/);
    assert.match(html, /Application under review/);
    assert.match(html, /Available after your application is approved/);
    assert.doesNotMatch(html, /href="\/portal\/teacher\/certification\/programs"/); // not a live link yet
  });
});

test('approved: unlocked, the certification tools are live links', () => {
  const html = renderQteDashboard('approved');
  assert.match(html, /href="\/portal\/teacher\/certification\/programs"/);
  assert.match(html, /href="\/portal\/teacher\/certification\/grading"/);
  assert.doesNotMatch(html, /Available after your application is approved/);
});

test('rejected: unlocked, shows the reason and a Re-apply link that reopens the prefilled application step', () => {
  const html = renderQteDashboard('rejected', { rejected_reason: 'Please add your teaching certificates.' });
  assert.match(html, /Please add your teaching certificates\./);
  assert.match(html, /Update and re-apply/);
  assert.match(html, /href="\/portal\/teacher\/editProfile\?reapply=1"/);
});

test('rejected: the re-applied step is prefilled from the previous answers, and the agreement starts unaccepted', () => {
  const previous = {
    legal_name: 'Ada Lovelace', public_name: 'Ada', country: 'UK', timezone: 'Europe/London',
    teaching_experience_years: 7, sample_curriculum: 'https://x.test/c', sample_lecture_link: 'https://x.test/l',
    prior_student_count: 120, government_id_file: 'certification/id.pdf', resume_file: 'certification/cv.pdf',
  };
  const values = qteApp.qteInitialValues({ ...previous, application_status: 'rejected' });
  assert.deepEqual({ ...values, agreement_accepted: undefined }, { ...previous, agreement_accepted: undefined });
  assert.equal(values.agreement_accepted, false);
});

test('suspended: a locked explanatory view with a support link, and no tools', () => {
  const html = renderQteDashboard('suspended');
  assert.match(html, /Account suspended/);
  assert.match(html, /contact support/i);
  assert.match(html, /href="\/portal\/help-support"/);
  assert.doesNotMatch(html, /Certification Programs/);
});

// --- step 4: two short sections ------------------------------------------------------------------------------

test('step 4 is two sections of 6 and 5 inputs, together exactly the 11 application inputs', () => {
  const [first, second] = qteApp.QTE_APPLICATION_SECTIONS;
  assert.equal(first.fields.length, 6);
  assert.equal(second.fields.length, 5);
  assert.equal(new Set(qteApp.QTE_APPLICATION_FIELDS).size, 11);
  assert.ok(qteApp.QTE_APPLICATION_SECTIONS.every(section => section.fields.length <= 6));
});

const renderStep = (section, selected = {}) =>
  renderToStaticMarkup(
    React.createElement(
      Formik,
      { initialValues: qteApp.qteInitialValues(selected), onSubmit() {} },
      React.createElement(QteApplicationStep, { section, onSectionChange() {}, selected, isBlocked: false, onPersist() {} })
    )
  );

test('each section renders only its own inputs, the pager says which section, and the device-draft note shows', () => {
  const first = renderStep(0);
  ['Legal Name', 'Public Name', 'Country', 'Timezone', 'Teaching Experience', 'Prior Student Count'].forEach(label => assert.match(first, new RegExp(label)));
  ['Sample Curriculum', 'Government ID', 'Resume'].forEach(label => assert.doesNotMatch(first, new RegExp(label)));
  assert.match(first, /Section 1 of 2/);
  assert.match(first, /saved on this device only/);

  const second = renderStep(1);
  ['Sample Curriculum', 'Sample Lecture', 'Government ID', 'Resume', 'Terms of Service'].forEach(label => assert.match(second, new RegExp(label)));
  ['Legal Name', 'Prior Student Count'].forEach(label => assert.doesNotMatch(second, new RegExp(label)));
  assert.match(second, /Section 2 of 2/);
});

test('a failed final check jumps to the first section with an error', () => {
  assert.equal(qteApp.firstQteSectionWithError({ resume_file: 'Resume is required' }), 1);
  assert.equal(qteApp.firstQteSectionWithError({ resume_file: 'x', country: 'y' }), 0);
  assert.equal(qteApp.firstQteSectionWithError({}), undefined);
});

// --- the device-only draft -----------------------------------------------------------------------------------

const fakeStorage = () => {
  const map = new Map();
  return { map, getItem: key => (map.has(key) ? map.get(key) : null), setItem: (key, value) => map.set(key, String(value)), removeItem: key => map.delete(key) };
};

test('draft restore: saved answers and step come back; a picked file is not stored (it would come back as {})', () => {
  const storage = fakeStorage();
  qteApp.saveDraft(storage, 'k', { legal_name: 'Ada', prior_student_count: 3, resume_file: new Blob(['x']), government_id_file: 'certification/id.pdf', certifications: [1, 2] }, 4);
  const restored = qteApp.loadDraft(storage, 'k');
  assert.equal(restored.step, 4);
  assert.equal(restored.values.legal_name, 'Ada');
  assert.equal(restored.values.prior_student_count, 3);
  assert.equal(restored.values.resume_file, null);
  assert.equal(restored.values.government_id_file, 'certification/id.pdf'); // an uploaded key is kept
  assert.deepEqual(restored.values.certifications, [1, 2]);
});

test('draft restore: nothing saved -> null; a corrupt draft is dropped instead of crashing', () => {
  const storage = fakeStorage();
  assert.equal(qteApp.loadDraft(storage, 'k'), null);
  storage.setItem('k', '{not json');
  assert.equal(qteApp.loadDraft(storage, 'k'), null);
  assert.equal(storage.getItem('k'), null);
});

const validValues = { legal_name: 'Ada', agreement_accepted: true, government_id_file: new Blob(['id']), resume_file: 'certification/cv.pdf' };

test('a successful submit uploads only new files, sends the application and clears the device draft', async () => {
  const storage = fakeStorage();
  qteApp.saveDraft(storage, 'k', validValues, 4);
  const uploads = [];
  const sent = [];
  await qteApp.submitQteApplication({
    values: validValues,
    upload: async ({ file }) => { uploads.push(file); return { data: { file_key: 'certification/new-id.pdf' } }; },
    apply: async ({ payload }) => { sent.push(payload); },
    clearDraftFn: () => qteApp.clearDraft(storage, 'k'),
  });
  assert.equal(uploads.length, 1); // the resume was already an uploaded key
  assert.equal(sent[0].government_id_file, 'certification/new-id.pdf');
  assert.equal(sent[0].resume_file, 'certification/cv.pdf');
  assert.equal(sent[0].agreement_accepted, true);
  assert.equal(storage.getItem('k'), null, 'draft must be cleared after a successful submit');
});

test('a rejected submit keeps the draft — nothing typed is lost', async () => {
  const storage = fakeStorage();
  qteApp.saveDraft(storage, 'k', validValues, 4);
  await assert.rejects(
    qteApp.submitQteApplication({
      values: validValues,
      upload: async () => ({ data: { file_key: 'k' } }),
      apply: async () => { throw new Error('400'); },
      clearDraftFn: () => qteApp.clearDraft(storage, 'k'),
    })
  );
  assert.ok(storage.getItem('k'), 'draft must survive a failed submit');
});

// --- sidebar -------------------------------------------------------------------------------------------------

const labels = items => items.map(item => item.label);

test('approved QTE keeps Dashboard, Certification Programs, Grading Queue, My Circle, Payments (Help & Support / Logout are the footer)', () => {
  const items = SIDEBAR.getTeacherSidebarMenuItems(true, false, false, true, false);
  assert.deepEqual(labels(items), ['Dashboard', 'Certification Programs', 'Grading Queue', 'My Circle', 'Payments']);
});

test('QTE users who are not approved get a QTE menu with no Expert items', () => {
  const expertOnly = ['Guided Experiences', 'Referrals', 'My Circle', 'Payments', 'Certification Programs'];
  assert.deepEqual(labels(SIDEBAR.getQteTrackSidebarMenuItems('locked')), ['Complete Application', 'Profile']);
  assert.deepEqual(labels(SIDEBAR.getQteTrackSidebarMenuItems('unlocked')), ['Dashboard', 'Profile']);
  assert.deepEqual(labels(SIDEBAR.getQteTrackSidebarMenuItems('suspended')), ['Dashboard']);
  ['locked', 'unlocked', 'suspended'].forEach(view =>
    labels(SIDEBAR.getQteTrackSidebarMenuItems(view)).forEach(label => assert.ok(!expertOnly.includes(label), `${view}: ${label}`)));
});

test('a normal expert keeps the full Expert menu', () => {
  const items = SIDEBAR.getTeacherSidebarMenuItems(true, true, true, false, false);
  assert.ok(labels(items).includes('Guided Experiences'));
  assert.ok(labels(items).includes('Referrals'));
});

// --- the hook: the auth payload is enough, no request ---------------------------------------------------------

const Probe = () => {
  const qte = useApprovedQTE();
  return React.createElement('span', null, `${qte.view}|${qte.isApprovedQTE}`);
};

test('useApprovedQTE reads the profile keys and makes no /me/ request when they are present', () => {
  const html = profile => { setProfile(profile); return renderToStaticMarkup(React.createElement(Probe)); };
  assert.match(html(teacher('qte', 'approved')), /unlocked\|true/);
  assert.match(html(teacher('qte', 'draft')), /locked\|false/);
  assert.match(html(teacher('expert', 'draft')), /not-qte\|false/);
  assert.match(html(teacher(null, null)), /not-qte\|false/);
  assert.equal(harness.axiosCalls.length, 0);
});
