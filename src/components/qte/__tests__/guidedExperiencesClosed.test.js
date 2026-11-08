// QTE-track users (any application status) and Institutions never see or use Guided Experiences: profile tab
// list per user type, the ?active_tab= redirect rule, the route guard for the guided pages, the public profile,
// and the Quick Steps. Plain Experts must be exactly as before. Server-rendered with the shared stub harness:
// markup text and decisions only, NOT appearance (nothing was looked at in a browser).
//
//   node -r sucrase/register -r ./src/components/certification/learner/__tests__/harness.cjs \
//        --test src/components/qte/__tests__/guidedExperiencesClosed.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const harness = require('../../certification/learner/__tests__/harness.cjs');

// What the stubbed requests answer, and which ones were enabled.
const scenario = { calls: [], programs: [], publicPrograms: [] };
const stubs = {
  '@tanstack/react-query': {
    useQuery: opts => {
      const key = opts.queryKey[0];
      scenario.calls.push({ key, enabled: opts.enabled !== false });
      if (opts.enabled === false) return { data: undefined, isFetching: false };
      const payload = key === 'certificationMyPrograms' ? { data: scenario.programs } : { data: { data: scenario.publicPrograms } };
      return { data: opts.select ? opts.select(payload) : payload, isFetching: false };
    },
    useMutation: () => ({ mutateAsync: async () => ({}), isPending: false }),
    useQueryClient: () => ({ invalidateQueries() {} }),
  },
  '@/utils/query-keys': { __esModule: true, default: require('../../../utils/query-keys').default },
  // the heavy tab panels are stand-ins; the markers tell which ones were mounted
  './groupCoaching': { __esModule: true, default: () => React.createElement('div', null, 'GUIDED-PANEL') },
  './consultation': { __esModule: true, default: () => React.createElement('div', null, 'CONSULT-PANEL') },
  './consultations': { __esModule: true, default: () => React.createElement('div', null, 'CONSULT-PANEL') },
  './programs': { __esModule: true, default: () => React.createElement('div', null, 'PROGRAMS-PANEL') },
  './about': { __esModule: true, default: () => React.createElement('div', null, 'ABOUT-PANEL') },
  '@/components/common/ExpertProfileWithLogo': { __esModule: true, default: () => null },
};
const previousLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (Object.prototype.hasOwnProperty.call(stubs, request)) return stubs[request];
  return previousLoad.apply(this, arguments);
};

const profileTabs = require('../../../utils/profileTabs');
const qteTrack = require('../../../utils/qteTrack');
const OwnProfile = require('../../expert/profile').default;
const PublicProfile = require('../../public/expertProfile').default;
const InfoNote = require('../../common/CompleteProfileInfo').default;
const QteTrackGuard = require('../QteTrackGuard').default;

const QTE_STATUSES = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'suspended'];
const teacher = (creator_type, application_status) => ({ role: 'Teacher', creator_type, application_status, rejected_reason: null });
const reset = (profile, activeTab) => {
  harness.reset();
  harness.pathname = '/portal/teacher/profile';
  if (activeTab) harness.url = new URLSearchParams({ active_tab: activeTab });
  harness.user = { profile };
  scenario.calls = [];
  scenario.programs = [];
  scenario.publicPrograms = [];
};
const renderOwnProfile = (profile, activeTab) => {
  reset(profile, activeTab);
  return renderToStaticMarkup(React.createElement(OwnProfile, { data: { first_name: 'A', last_name: 'B', is_profile_complete: true } }));
};
const labels = tabs => tabs.map(tab => tab.label);

// --- the tab list per user type ------------------------------------------------------------------------------

test('tab list: a plain Expert keeps Guided Experiences (disabled until the profile is complete) + About', () => {
  const incomplete = profileTabs.getOwnProfileTabs({ certificationCreator: false, profileComplete: false });
  assert.deepEqual(labels(incomplete), ['Guided Experiences', 'About']);
  assert.deepEqual(incomplete.map(tab => tab.disabled), [true, false]);
  assert.deepEqual(profileTabs.getOwnProfileTabs({ certificationCreator: false, profileComplete: true }).map(tab => tab.disabled), [false, false]);
});

test('tab list: QTE-track users (any status) and Institutions get Certification Programs + About, never Guided Experiences', () => {
  QTE_STATUSES.forEach(status => {
    const creator = profileTabs.isCertificationCreator({ isQteTrack: qteTrack.getQteTrackState(teacher('qte', status)).isQteTrack, role: 'Teacher' });
    assert.equal(creator, true, status);
    const tabs = profileTabs.getOwnProfileTabs({ certificationCreator: creator, profileComplete: false });
    assert.deepEqual(labels(tabs), ['Certification Programs', 'About'], status);
    assert.ok(tabs.every(tab => !tab.disabled), status);
  });
  assert.equal(profileTabs.isCertificationCreator({ isQteTrack: false, role: 'Institution' }), true);
  assert.equal(profileTabs.isCertificationCreator({ isQteTrack: false, role: 'Teacher' }), false);
  assert.equal(profileTabs.isCertificationCreator({ isQteTrack: false, role: 'Customer' }), false);
  assert.equal(profileTabs.isCertificationCreator({ isQteTrack: qteTrack.getQteTrackState(teacher('expert', 'draft')).isQteTrack, role: 'Teacher' }), false);
});

// --- ?active_tab= --------------------------------------------------------------------------------------------

test('active_tab rule: a certification creator on the guided tab (or any tab they do not have) is redirected to the certifications tab', () => {
  const resolve = activeTab => profileTabs.resolveOwnProfileTab({ activeTab, certificationCreator: true });
  assert.deepEqual(resolve('group_coaching'), { tab: 'certifications', redirectTo: 'certifications' });
  assert.deepEqual(resolve('consult'), { tab: 'certifications', redirectTo: 'certifications' });
  assert.deepEqual(resolve('programs'), { tab: 'certifications', redirectTo: 'certifications' });
  assert.deepEqual(resolve('something-else'), { tab: 'certifications', redirectTo: 'certifications' });
  assert.deepEqual(resolve('certifications'), { tab: 'certifications', redirectTo: null });
  assert.deepEqual(resolve('about'), { tab: 'about', redirectTo: null });
  assert.deepEqual(resolve(null), { tab: 'about', redirectTo: null }); // same default as today
});

test('active_tab rule: a plain Expert is exactly as before (the URL is taken as is, About when absent)', () => {
  const resolve = activeTab => profileTabs.resolveOwnProfileTab({ activeTab, certificationCreator: false });
  assert.deepEqual(resolve('group_coaching'), { tab: 'group_coaching', redirectTo: null });
  assert.deepEqual(resolve('consult'), { tab: 'consult', redirectTo: null });
  assert.deepEqual(resolve(null), { tab: 'about', redirectTo: null });
});

// --- the profile page, rendered ------------------------------------------------------------------------------

test('profile page, plain Expert: Guided Experiences tab and panel, no Certification Programs', () => {
  const html = renderOwnProfile(teacher('expert', 'draft'), 'group_coaching');
  assert.match(html, /Guided Experiences/);
  assert.match(html, /GUIDED-PANEL/);
  assert.doesNotMatch(html, /Certification Programs/);
  assert.equal(scenario.calls.some(call => call.key === 'certificationMyPrograms' && call.enabled), false);
});

test('profile page, QTE on ?active_tab=group_coaching: the certifications tab shows their programs, Guided Experiences is nowhere', () => {
  QTE_STATUSES.forEach(status => {
    scenario.programs = [];
    const html = renderOwnProfile(teacher('qte', status), 'group_coaching');
    assert.match(html, /Certification Programs/, status);
    assert.doesNotMatch(html, /Guided Experiences|GUIDED-PANEL|CONSULT-PANEL/, status);
  });
  reset(teacher('qte', 'approved'), 'group_coaching');
  scenario.programs = [{ id: 7, title: 'Gentle Yoga Teacher Training', status: 'public', updated_at: '2026-10-01T00:00:00Z' }];
  const html = renderToStaticMarkup(React.createElement(OwnProfile, { data: { is_profile_complete: true } }));
  assert.match(html, /Gentle Yoga Teacher Training/);
  assert.match(html, /href="\/portal\/teacher\/certification\/programs\/builder\/7"/);
  assert.match(html, /href="\/portal\/teacher\/certification\/programs\/7\/preview"/);
});

test('profile page, approved QTE with no program: the "Create your first certification program" button', () => {
  const html = renderOwnProfile(teacher('qte', 'approved'), 'certifications');
  assert.match(html, /Create your first certification program/);
  assert.match(html, /href="\/portal\/teacher\/certification\/programs\/builder\/new"/);
});

test('profile page, QTE not approved: no button and no programs request', () => {
  ['draft', 'submitted', 'under_review', 'rejected', 'suspended'].forEach(status => {
    const html = renderOwnProfile(teacher('qte', status), 'certifications');
    assert.doesNotMatch(html, /Create your first certification program/, status);
    assert.match(html, /once your application is approved/, status);
    assert.ok(scenario.calls.filter(call => call.key === 'certificationMyPrograms').every(call => !call.enabled), status);
  });
});

test('profile page, Institution: the certifications tab (nothing guided), institution links', () => {
  reset({ role: 'Institution' }, 'group_coaching');
  const html = renderToStaticMarkup(React.createElement(OwnProfile, { data: { is_profile_complete: true } }));
  assert.match(html, /Certification Programs/);
  assert.doesNotMatch(html, /Guided Experiences|GUIDED-PANEL/);
});

// --- route guard ---------------------------------------------------------------------------------------------

const GUIDED_URLS = [
  '/portal/teacher/group_coaching/add', '/portal/teacher/group_coaching/12/edit',
  '/portal/teacher/group_coaching/12/details', '/portal/teacher/group_coaching/add?copy_from=12',
];

test('guard: every guided page redirects a QTE-track user, whatever the status (locked -> wizard, the rest -> dashboard)', () => {
  const expected = {
    draft: '/portal/teacher/editProfile', submitted: '/portal/teacher/dashboard', under_review: '/portal/teacher/dashboard',
    approved: '/portal/teacher/dashboard', rejected: '/portal/teacher/dashboard', suspended: '/portal/teacher/dashboard',
  };
  QTE_STATUSES.forEach(status => {
    const state = qteTrack.getQteTrackState(teacher('qte', status));
    GUIDED_URLS.forEach(url => {
      assert.equal(qteTrack.isGuidedExperiencePath(url), true, url);
      assert.deepEqual(qteTrack.resolveTeacherAreaRoute(url, state, 'Teacher'), { action: 'redirect', to: expected[status] }, `${status} ${url}`);
    });
  });
});

test('guard: an Institution has no page under /portal/teacher — guided URLs and the profile send it to its own dashboard', () => {
  const state = qteTrack.getQteTrackState({ role: 'Institution' });
  GUIDED_URLS.concat('/portal/teacher/profile?active_tab=group_coaching', '/portal/teacher/dashboard').forEach(url =>
    assert.deepEqual(qteTrack.resolveTeacherAreaRoute(url, state, 'Institution'), { action: 'redirect', to: '/portal/institution/dashboard' }, url));
});

test('guard: plain Experts, learners and admins are allowed on the guided pages exactly as before', () => {
  [[teacher('expert', 'draft'), 'Teacher'], [teacher(null, null), 'Teacher'], [{ role: 'Customer' }, 'Customer'], [{ role: 'Admin' }, 'Admin']].forEach(([profile, role]) => {
    const state = qteTrack.getQteTrackState(profile);
    GUIDED_URLS.forEach(url => assert.deepEqual(qteTrack.resolveTeacherAreaRoute(url, state, role), { action: 'allow' }, `${role} ${url}`));
  });
  assert.equal(qteTrack.isGuidedExperiencePath('/portal/teacher/dashboard'), false);
  assert.equal(qteTrack.isGuidedExperiencePath('/portal/teacher/certification/programs'), false);
});

test('guard component: a QTE or Institution never mounts a guided page; a plain Expert does', () => {
  const render = (profile, pathname) => {
    reset(profile);
    harness.pathname = pathname;
    return renderToStaticMarkup(React.createElement(QteTrackGuard, null, React.createElement('div', null, 'GUIDED-PAGE')));
  };
  assert.doesNotMatch(render(teacher('qte', 'approved'), '/portal/teacher/group_coaching/add'), /GUIDED-PAGE/);
  assert.doesNotMatch(render(teacher('qte', 'submitted'), '/portal/teacher/group_coaching/5/edit'), /GUIDED-PAGE/);
  assert.doesNotMatch(render({ role: 'Institution' }, '/portal/teacher/group_coaching/add'), /GUIDED-PAGE/);
  assert.match(render(teacher('expert', 'draft'), '/portal/teacher/group_coaching/add'), /GUIDED-PAGE/);
});

// --- public profile ("Share Profile") ------------------------------------------------------------------------

test('public profile: a QTE shows certification programs instead of Guided Experiences; a plain Expert is unchanged', () => {
  reset({});
  scenario.publicPrograms = [{ id: 3, title: 'Public Cert Program', price: '0.00', currency: 'USD', payment_type: 'free', creator_type: 'qte', seat_limit: null }];
  const qte = renderToStaticMarkup(React.createElement(PublicProfile, { data: { id: 5, first_name: 'Q', creator_type: 'qte' } }));
  assert.match(qte, /Certification Programs/);
  assert.match(qte, /Public Cert Program/);
  assert.doesNotMatch(qte, /Guided Experiences|GUIDED-PANEL|PROGRAMS-PANEL|CONSULT-PANEL/);
  assert.ok(scenario.calls.every(call => call.key !== 'publicExpertGroupCoaching'));

  reset({});
  const plain = renderToStaticMarkup(React.createElement(PublicProfile, { data: { id: 6, first_name: 'P', creator_type: 'expert' } }));
  assert.match(plain, /Guided Experiences/);
  assert.match(plain, /GUIDED-PANEL/);
  assert.doesNotMatch(plain, /Certification Programs/);
});

test('public profile tab rules', () => {
  assert.deepEqual(labels(profileTabs.getPublicProfileTabs({ creatorType: 'qte' })), ['Certification Programs', 'About']);
  assert.deepEqual(labels(profileTabs.getPublicProfileTabs({ creatorType: 'expert' })), ['Guided Experiences', 'About']);
  assert.deepEqual(labels(profileTabs.getPublicProfileTabs({ creatorType: undefined })), ['Guided Experiences', 'About']);
  const initial = args => profileTabs.initialPublicProfileTab(args);
  assert.equal(initial({ creatorType: 'qte', activeTab: 'group_coaching', plainInitial: 'group_coaching' }), 'certifications');
  assert.equal(initial({ creatorType: 'qte', activeTab: 'about', plainInitial: 'group_coaching' }), 'about');
  assert.equal(initial({ creatorType: 'expert', activeTab: 'about', plainInitial: 'group_coaching' }), 'group_coaching');
});

// --- Quick Steps ---------------------------------------------------------------------------------------------

const quickSteps = (profile, expertData) => {
  reset(profile);
  return renderToStaticMarkup(React.createElement(InfoNote, { expertData }));
};

test('Quick Steps: the "Add Guided Experiences" step is gone for every QTE-track status and stays for a plain Expert', () => {
  const expertData = { is_profile_complete: true, stripe_onboarded: true, has_event_or_consult: false };
  QTE_STATUSES.forEach(status =>
    assert.doesNotMatch(quickSteps(teacher('qte', status), expertData), /Add Guided Experiences|group_coaching/, status));
  assert.match(quickSteps(teacher('expert', 'draft'), expertData), /Add Guided Experiences/);
});
