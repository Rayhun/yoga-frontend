// QTE-track state, derived from the signed-in user's profile (`creator_type`, `application_status`,
// `rejected_reason` come with the auth payload, so nothing here needs a request).
//
// RULE: `application_status` is read ONLY when `creator_type === 'qte'`. A plain Expert reports "draft"
// by default, which must never be mistaken for a locked QTE application.

export const QTE_VIEW = {
  LOADING: 'loading', // the profile is not there yet — callers render nothing role-specific
  NOT_QTE: 'not-qte', // plain Experts, learners, institutions, admins, anyone without an Expert row
  LOCKED: 'locked', // creator_type 'qte' + application_status 'draft': the application wizard only
  SUSPENDED: 'suspended', // locked, explanatory view
  UNLOCKED: 'unlocked', // submitted / under_review / approved / rejected: the QTE dashboard
};

export const TEACHER_DASHBOARD_PATH = '/portal/teacher/dashboard';
export const QTE_WIZARD_PATH = '/portal/teacher/editProfile';
export const QTE_REAPPLY_PATH = `${QTE_WIZARD_PATH}?reapply=1`;

const TEACHER_ROLE = 'Teacher';

function baseState(view) {
  return {
    view,
    isLoading: view === QTE_VIEW.LOADING,
    isQteTrack: false,
    applicationStatus: null,
    isApproved: false,
    isRejected: false,
    rejectedReason: '',
  };
}

/**
 * @param {object|null|undefined} source `{ role, creator_type, application_status, rejected_reason }` — the user
 *   profile (or the profile's role merged with the legacy `/certification/apply/expert-qte/me/` answer).
 */
export const getQteTrackState = source => {
  const role = source?.role;
  if (!role) return baseState(QTE_VIEW.LOADING);
  if (role !== TEACHER_ROLE || source.creator_type !== 'qte') return baseState(QTE_VIEW.NOT_QTE);

  const applicationStatus = source.application_status || 'draft';
  const view =
    applicationStatus === 'draft'
      ? QTE_VIEW.LOCKED
      : applicationStatus === 'suspended'
        ? QTE_VIEW.SUSPENDED
        : QTE_VIEW.UNLOCKED;

  return {
    ...baseState(view),
    isQteTrack: true,
    applicationStatus,
    isApproved: applicationStatus === 'approved',
    isRejected: applicationStatus === 'rejected',
    rejectedReason: applicationStatus === 'rejected' ? source.rejected_reason || '' : '',
  };
};

// Teacher pages that belong to the plain-Expert product. A QTE-track user is never sent to them.
const EXPERT_ONLY_PATHS = [
  '/portal/teacher/group_coaching',
  '/portal/teacher/consultation',
  '/portal/teacher/program',
  '/portal/teacher/referrals',
  '/portal/teacher/wellness-insights',
];
// What a locked (draft) user may open: the wizard and their profile — nothing else.
const LOCKED_ALLOWED_PATHS = [QTE_WIZARD_PATH, '/portal/teacher/profile'];

const matchesPath = (pathname, base) => pathname === base || pathname.startsWith(`${base}/`);
const matchesAny = (pathname, bases) => bases.some(base => matchesPath(pathname, base));

/**
 * What the guard under /portal/teacher must do for `pathname`:
 *   { action: 'wait' }              the profile is not loaded — render a loader, no page
 *   { action: 'allow' }             render the page
 *   { action: 'redirect', to }      QTE-track user on a page that is not theirs
 * Normal Experts (and every other role) are always allowed.
 */
export const resolveTeacherRoute = (pathname, state) => {
  const path = (pathname || '').split('?')[0].replace(/\/+$/, '');
  if (state.view === QTE_VIEW.LOADING) return { action: 'wait' };
  if (!state.isQteTrack) return { action: 'allow' };

  if (state.view === QTE_VIEW.LOCKED) {
    return matchesAny(path, LOCKED_ALLOWED_PATHS) ? { action: 'allow' } : { action: 'redirect', to: QTE_WIZARD_PATH };
  }
  if (state.view === QTE_VIEW.SUSPENDED) {
    return path === TEACHER_DASHBOARD_PATH ? { action: 'allow' } : { action: 'redirect', to: TEACHER_DASHBOARD_PATH };
  }

  // unlocked: submitted / under_review / approved / rejected
  if (matchesPath(path, '/portal/teacher/apply-qte')) {
    // the wizard's step 4 is the one application form; a rejected user reopens it prefilled
    return { action: 'redirect', to: state.isRejected ? QTE_REAPPLY_PATH : TEACHER_DASHBOARD_PATH };
  }
  if (matchesAny(path, EXPERT_ONLY_PATHS)) return { action: 'redirect', to: TEACHER_DASHBOARD_PATH };
  return { action: 'allow' };
};

/** Where `/portal` (the landing page every role passes through) sends a Teacher on the QTE track. */
export const getQtePortalTarget = state => {
  if (!state.isQteTrack) return null;
  return state.view === QTE_VIEW.LOCKED ? QTE_WIZARD_PATH : TEACHER_DASHBOARD_PATH;
};
