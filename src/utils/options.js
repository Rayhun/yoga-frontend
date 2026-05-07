import {
  ACCESS_SETTING,
  CONTENT_TYPE,
  DIFFICULTY,
  INTENSITY_LEVEL,
  MODULE_TYPE,
  LMS_DOC_STATUS,
  VISIBILITY_SETTING,
  PROGRAM_TYPE,
  ONBOARDING_QUIZ_CONTENT_TYPE,
  SUBSCRIPTION_PAGE_STATUS,
  SUBSCRIPTION_PAGE_TYPE,
  SUBSCRIPTION_PAGE_TENURE,
  GROUP_VISIBILITY,
} from './enums';

export const CONTENT_TYPE_OPTIONS = [
  {
    label: 'Program',
    value: CONTENT_TYPE.program,
  },
  {
    label: 'Module',
    value: CONTENT_TYPE.module,
  },
  {
    label: 'Video',
    value: CONTENT_TYPE.video,
  },
  {
    label: 'Audio',
    value: CONTENT_TYPE.audio,
  },
  {
    label: 'Image',
    value: CONTENT_TYPE.image,
  },
  {
    label: 'Quiz',
    value: CONTENT_TYPE.quiz,
  },
];

export const ACCESS_SETTING_OPTIONS = [
  {
    label: 'Open',
    value: ACCESS_SETTING.open,
  },
  
  {
    label: 'Free',
    value: ACCESS_SETTING.free,
  },
  {
    label: 'Buy Now',
    value: ACCESS_SETTING.buy_now,
  },
  // {
  //   label: 'Recurring',
  //   value: ACCESS_SETTING.recurring,
  // },
  {
    label: 'Closed',
    value: ACCESS_SETTING.closed,
  },
];

export const VISIBILITY_SETTING_OPTIONS = [
  {
    label: 'Logged-In',
    value: VISIBILITY_SETTING.logged_in,
  },
];

export const LMS_DOC_STATUS_OPTIONS = [
  {
    label: 'Published',
    value: LMS_DOC_STATUS.published,
  },
  {
    label: 'Draft',
    value: LMS_DOC_STATUS.draft,
  },
  {
    label: 'InActive',
    value: LMS_DOC_STATUS.inactive,
  },
];

export const DIFFICULTY_OPTIONS = [
  {
    label: 'Introductory',
    value: DIFFICULTY.introductory,
  },
  {
    label: 'Intermediate',
    value: DIFFICULTY.intermediate,
  },
  {
    label: 'Expert',
    value: DIFFICULTY.expert,
  },
];

export const INTENSITY_LEVEL_OPTIONS = [
  {
    label: 'Level 1',
    value: INTENSITY_LEVEL.level_1,
  },
  {
    label: 'Level 2',
    value: INTENSITY_LEVEL.level_2,
  },
  {
    label: 'Level 3',
    value: INTENSITY_LEVEL.level_3,
  },
  {
    label: 'Level 4',
    value: INTENSITY_LEVEL.level_4,
  },
  {
    label: 'Level 5',
    value: INTENSITY_LEVEL.level_5,
  },
  {
    label: 'Level 6',
    value: INTENSITY_LEVEL.level_6,
  },
  {
    label: 'Level 7',
    value: INTENSITY_LEVEL.level_7,
  },
  {
    label: 'Level 8',
    value: INTENSITY_LEVEL.level_8,
  },
  {
    label: 'Level 9',
    value: INTENSITY_LEVEL.level_9,
  },
  {
    label: 'Level 10',
    value: INTENSITY_LEVEL.level_10,
  },
];

export const MODULE_TYPE_OPTIONS = [
  {
    label: 'Image',
    value: MODULE_TYPE.image,
  },
  {
    label: 'Audio',
    value: MODULE_TYPE.audio,
  },
  {
    label: 'Video',
    value: MODULE_TYPE.video,
  },
  {
    label: 'Quiz',
    value: MODULE_TYPE.quiz,
  },
];

export const PROGRAM_TYPE_OPTIONS = [
  {
    label: 'Image',
    value: PROGRAM_TYPE.image,
  },
  {
    label: 'Audio',
    value: PROGRAM_TYPE.audio,
  },
  {
    label: 'Video',
    value: PROGRAM_TYPE.video,
  },
  {
    label: 'Quiz',
    value: PROGRAM_TYPE.quiz,
  },
  {
    label: 'Module',
    value: PROGRAM_TYPE.module,
  },
];

export const ONBOARDING_QUIZ_CONTENT_TYPE_OPTIONS = [
  {
    label: 'Text',
    value: ONBOARDING_QUIZ_CONTENT_TYPE.text,
  },
  {
    label: 'Image',
    value: ONBOARDING_QUIZ_CONTENT_TYPE.image,
  },
];

export const SUBSCRIPTION_PAGE_STATUS_OPTIONS = [
  {
    label: 'Active',
    value: SUBSCRIPTION_PAGE_STATUS.active,
  },
  {
    label: 'InActive',
    value: SUBSCRIPTION_PAGE_STATUS.in_active,
  },
];

export const SUBSCRIPTION_PAGE_TYPE_OPTIONS = [
  {
    label: 'Individual',
    value: SUBSCRIPTION_PAGE_TYPE.individual,
  },
  {
    label: 'Business',
    value: SUBSCRIPTION_PAGE_TYPE.busniess,
  },
];

export const SUBSCRIPTION_PAGE_TENURE_OPTIONS = [
  {
    label: 'Monthly',
    value: SUBSCRIPTION_PAGE_TENURE.monthly,
  },
  {
    label: 'Quaterly',
    value: SUBSCRIPTION_PAGE_TENURE.quaterly,
  },
  {
    label: 'Yearly',
    value: SUBSCRIPTION_PAGE_TENURE.yearly,
  },
];

export const GROUP_VISIBILITY_OPTIONS = [
  {
    label: 'Public',
    value: GROUP_VISIBILITY.public,
  },
  {
    label: 'Private',
    value: GROUP_VISIBILITY.private,
  },
];

export const SUBSCRIPTION_FREE_TRIAL_OPTIONS = [
  { label: 'No Trial', value: 0 },
  { label: '3 Days', value: 3 },
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '21 Days', value: 21 },
];