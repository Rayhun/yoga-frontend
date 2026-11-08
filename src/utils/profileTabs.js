// Which tabs an Expert profile shows. QTE-track Experts (any application status) and Institutions never see or
// use Guided Experiences — they work with Certification programs — so their profile has a "Certification
// Programs" tab where everybody else has "Guided Experiences". Plain Experts keep exactly today's tabs.
// Pure rules, no React, so they can be unit-tested.

export const PROFILE_TAB = {
  GUIDED_EXPERIENCES: 'group_coaching',
  CERTIFICATIONS: 'certifications',
  ABOUT: 'about',
};

const INSTITUTION_ROLE = 'Institution';

/** True for the creators that use Certification programs instead of Guided Experiences. */
export const isCertificationCreator = ({ isQteTrack, role }) => Boolean(isQteTrack) || role === INSTITUTION_ROLE;

/** The tabs on the creator's own profile (/portal/teacher/profile). */
export const getOwnProfileTabs = ({ certificationCreator, profileComplete }) =>
  certificationCreator
    ? [
        { value: PROFILE_TAB.CERTIFICATIONS, label: 'Certification Programs', disabled: false },
        { value: PROFILE_TAB.ABOUT, label: 'About', disabled: false },
      ]
    : [
        { value: PROFILE_TAB.GUIDED_EXPERIENCES, label: 'Guided Experiences', disabled: !profileComplete },
        { value: PROFILE_TAB.ABOUT, label: 'About', disabled: false },
      ];

/**
 * The tab to show for `?active_tab=`, and where to send the URL when it must change. Plain Experts: the URL is
 * taken as is (About when absent) — unchanged. Certification creators: only their own two tabs exist, so the
 * Guided Experiences tab (or any other tab they do not have) redirects to the Certification Programs tab.
 * @returns {{ tab: string, redirectTo: string | null }}
 */
export const resolveOwnProfileTab = ({ activeTab, certificationCreator }) => {
  if (!certificationCreator) return { tab: activeTab || PROFILE_TAB.ABOUT, redirectTo: null };
  if (!activeTab) return { tab: PROFILE_TAB.ABOUT, redirectTo: null };
  if (activeTab === PROFILE_TAB.ABOUT || activeTab === PROFILE_TAB.CERTIFICATIONS) return { tab: activeTab, redirectTo: null };
  return { tab: PROFILE_TAB.CERTIFICATIONS, redirectTo: PROFILE_TAB.CERTIFICATIONS };
};

const isQte = creatorType => creatorType === 'qte';

/** Tabs on the public / learner-facing profile of an Expert (`creator_type` comes from the Expert payload). */
export const getPublicProfileTabs = ({ creatorType }) =>
  isQte(creatorType)
    ? [
        { value: PROFILE_TAB.CERTIFICATIONS, label: 'Certification Programs' },
        { value: PROFILE_TAB.ABOUT, label: 'About' },
      ]
    : [
        { value: PROFILE_TAB.GUIDED_EXPERIENCES, label: 'Guided Experiences' },
        { value: PROFILE_TAB.ABOUT, label: 'About' },
      ];

/** Tab shown first on a public profile: a QTE starts on their programs, everyone else on `plainInitial`. */
export const initialPublicProfileTab = ({ creatorType, activeTab, plainInitial }) => {
  if (!isQte(creatorType)) return plainInitial;
  return activeTab === PROFILE_TAB.ABOUT ? PROFILE_TAB.ABOUT : PROFILE_TAB.CERTIFICATIONS;
};
