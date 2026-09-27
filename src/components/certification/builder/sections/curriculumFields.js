import dayjs from 'dayjs';

// Form <-> API mapping for Curriculum Builder modules/lessons, shared by ProgramBuilderModal
// (API -> form, pickModules) and CurriculumBuilderSection (form -> API, toPayload). Every field
// the builder edits must round-trip through both directions, or a save silently resets it.

export const DEFAULT_VIDEO_WATCH_THRESHOLD = 90; // CertLesson.video_watch_threshold_percent default

export const UNLOCK_RULE_OPTIONS = [
  { value: 'sequential', label: 'After the previous module is completed' },
  { value: 'immediate', label: 'Immediately' },
  { value: 'date', label: 'On a date' },
];

export const URL_LESSON_TYPES = ['video', 'pdf', 'link'];
export const TEXT_LESSON_TYPES = ['text', 'assignment'];

// Durations are stored as "12 min" (CertLesson.duration is free text); the builder edits minutes.
const DURATION_MINUTES_PATTERN = /^\s*(\d+)\s*(m|min|mins|minutes)?\s*$/i;
const toDurationMinutes = duration => DURATION_MINUTES_PATTERN.exec(duration || '')?.[1] ?? '';

const withId = item => (item.id ? { id: item.id } : {});

export const toModuleFormValues = module => ({
  id: module.id,
  _key: `module-${module.id}`,
  title: module.title || '',
  description: module.description || '',
  image: module.image || '',
  unlock_rule: module.unlock_rule || 'sequential',
  // <input type="date"> value, in the creator's local time zone.
  unlock_date: module.unlock_date ? dayjs(module.unlock_date).format('YYYY-MM-DD') : '',
});

export const toLessonFormValues = lesson => {
  const minutes = toDurationMinutes(lesson.duration);
  return {
    id: lesson.id,
    _key: `lesson-${lesson.id}`,
    title: lesson.title || '',
    lesson_type: lesson.lesson_type || 'video',
    content_url: lesson.content_url || '',
    text_content: lesson.text_content || '',
    image: lesson.image || '',
    duration_minutes: minutes,
    // A duration that isn't "N min" (entered before this UI existed) is kept as-is unless replaced.
    duration_legacy: minutes ? '' : lesson.duration || '',
    is_required_for_completion: lesson.is_required_for_completion ?? true,
    video_watch_threshold_percent: lesson.video_watch_threshold_percent ?? DEFAULT_VIDEO_WATCH_THRESHOLD,
  };
};

let keySequence = 0;
const newKey = prefix => `${prefix}-new-${Date.now()}-${(keySequence += 1)}`;

export const blankLesson = () => ({
  _key: newKey('lesson'),
  title: '',
  lesson_type: 'video',
  content_url: '',
  text_content: '',
  image: '',
  duration_minutes: '',
  duration_legacy: '',
  is_required_for_completion: true,
  video_watch_threshold_percent: DEFAULT_VIDEO_WATCH_THRESHOLD,
});

export const blankModule = () => ({
  _key: newKey('module'),
  title: '',
  description: '',
  image: '',
  unlock_rule: 'sequential',
  unlock_date: '',
  lessons: [],
});

const toDuration = lesson => {
  const minutes = parseInt(lesson.duration_minutes, 10);
  if (Number.isInteger(minutes) && minutes > 0) return `${minutes} min`;
  return lesson.duration_legacy || null;
};

const toThreshold = value => {
  const percent = parseInt(value, 10);
  return Number.isInteger(percent) ? percent : DEFAULT_VIDEO_WATCH_THRESHOLD;
};

const toLessonPayload = lesson => ({
  ...withId(lesson),
  title: lesson.title,
  lesson_type: lesson.lesson_type,
  content_url: URL_LESSON_TYPES.includes(lesson.lesson_type) ? lesson.content_url || null : null,
  text_content: TEXT_LESSON_TYPES.includes(lesson.lesson_type) ? lesson.text_content || null : null,
  image: lesson.image || null,
  duration: toDuration(lesson),
  is_required_for_completion: Boolean(lesson.is_required_for_completion),
  // Only meaningful for video; omitted otherwise so the stored value is left untouched.
  ...(lesson.lesson_type === 'video' ? { video_watch_threshold_percent: toThreshold(lesson.video_watch_threshold_percent) } : {}),
});

// The unlock date is only sent for the 'date' rule (local midnight of the picked day).
const toUnlockDate = module =>
  module.unlock_rule === 'date' && module.unlock_date ? dayjs(module.unlock_date).startOf('day').toISOString() : null;

// Strips UI-only fields (`_key`, duration helpers). The modules PUT is an id-preserving upsert:
// this payload IS the entire curriculum on every save (order from array position) — items with an
// `id` are updated in place, items without one are created, and anything missing is deleted.
export const toPayload = values => ({
  modules: (values.modules || []).map(module => ({
    ...withId(module),
    title: module.title,
    description: module.description || null,
    image: module.image || null,
    unlock_rule: module.unlock_rule || 'sequential',
    unlock_date: toUnlockDate(module),
    lessons: (module.lessons || []).map(toLessonPayload),
  })),
});

// The backend rejects blank module/lesson titles (400); saving mid-edit (e.g. right after "Add
// lesson") would fail every time, so the section waits until every item has a title.
export const hasUntitledItems = values =>
  (values.modules || []).some(
    module => !module.title?.trim() || (module.lessons || []).some(lesson => !lesson.title?.trim())
  );
