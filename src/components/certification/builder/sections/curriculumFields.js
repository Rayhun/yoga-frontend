import dayjs from 'dayjs';
import { richTextOrNull } from '@/components/certification/builder/richText';

// Form <-> API mapping for Curriculum Builder modules/lessons, shared by ProgramBuilderModal
// (API -> form, toModulesFormValues) and the curriculum panes (form -> API, the to*Payload helpers). Every field
// the builder edits must round-trip through both directions, or a save silently resets it.

export const DEFAULT_VIDEO_WATCH_THRESHOLD = 90; // CertLesson.video_watch_threshold_percent default
export const DEFAULT_QUIZ_PASS_MARK = 70; // CertLesson.quiz_pass_mark_percent default
export const SINGLE_CHOICE = 'single_choice';
export const MULTIPLE_CHOICE = 'multiple_choice';
export const MIN_QUIZ_OPTIONS = 2;

export const UNLOCK_RULE_OPTIONS = [
  { value: 'sequential', label: 'After the previous module is completed' },
  { value: 'immediate', label: 'Immediately' },
  { value: 'date', label: 'On a date' },
];

export const URL_LESSON_TYPES = ['video', 'pdf', 'link'];
export const TEXT_LESSON_TYPES = ['text', 'assignment'];
// Files uploaded through our own storage: `content_url` holds the private key the upload returns (never a link
// the creator typed), and the server's read-only `signed_content_url` is only for previewing it.
export const MEDIA_LESSON_TYPES = ['audio', 'image'];

// The patch for switching a lesson's type. `content_url` means different things per family (a link, an audio
// key, an image key) and the server rejects a link as a key, so it is cleared whenever the family changes
// (video -> audio, audio -> image, image -> pdf ...); between link types (video -> pdf) the link is kept.
export const lessonTypeChangePatch = (lesson, nextType) => {
  const patch = { lesson_type: nextType };
  const stored = lesson.lesson_type;
  const keepsContent = stored === nextType || (URL_LESSON_TYPES.includes(stored) && URL_LESSON_TYPES.includes(nextType));
  if (!keepsContent && (MEDIA_LESSON_TYPES.includes(stored) || MEDIA_LESSON_TYPES.includes(nextType))) {
    patch.content_url = '';
    patch.signed_content_url = '';
  }
  return patch;
};

// Durations are stored as "12 min" (CertLesson.duration is free text); the builder edits minutes.
const DURATION_MINUTES_PATTERN = /^\s*(\d+)\s*(m|min|mins|minutes)?\s*$/i;
const toDurationMinutes = duration => DURATION_MINUTES_PATTERN.exec(duration || '')?.[1] ?? '';

const withId = item => (item.id ? { id: item.id } : {});

let keySequence = 0;
const newKey = prefix => `${prefix}-new-${Date.now()}-${(keySequence += 1)}`;

const toOptionFormValues = option => ({
  id: option.id,
  _key: `option-${option.id}`,
  text: option.text || '',
  is_correct: Boolean(option.is_correct),
});

const toQuestionFormValues = question => ({
  id: question.id,
  _key: `question-${question.id}`,
  prompt: question.prompt || '',
  question_type: question.question_type || SINGLE_CHOICE,
  explanation: question.explanation || '',
  options: (question.options || []).map(toOptionFormValues),
});

export const blankOption = (text = '') => ({ _key: newKey('option'), text, is_correct: false });

export const blankQuestion = () => ({
  _key: newKey('question'),
  prompt: '',
  question_type: SINGLE_CHOICE,
  explanation: '',
  options: [blankOption(), blankOption()],
});

// "True/False" shortcut: a single-choice question with the two options pre-filled.
export const trueFalseQuestion = () => ({
  ...blankQuestion(),
  options: [blankOption('True'), blankOption('False')],
});

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
    signed_content_url: lesson.signed_content_url || '', // read-only preview link; never sent back
    text_content: lesson.text_content || '',
    image: lesson.image || '',
    duration_minutes: minutes,
    // A duration that isn't "N min" (entered before this UI existed) is kept as-is unless replaced.
    duration_legacy: minutes ? '' : lesson.duration || '',
    is_required_for_completion: lesson.is_required_for_completion ?? true,
    video_watch_threshold_percent: lesson.video_watch_threshold_percent ?? DEFAULT_VIDEO_WATCH_THRESHOLD,
    quiz_pass_mark_percent: lesson.quiz_pass_mark_percent ?? DEFAULT_QUIZ_PASS_MARK,
    quiz_max_attempts: lesson.quiz_max_attempts ?? '', // '' = unlimited
    questions: (lesson.questions || []).map(toQuestionFormValues),
  };
};

export const blankLesson = () => ({
  _key: newKey('lesson'),
  title: '',
  lesson_type: 'video',
  content_url: '',
  signed_content_url: '',
  text_content: '',
  image: '',
  duration_minutes: '',
  duration_legacy: '',
  is_required_for_completion: true,
  video_watch_threshold_percent: DEFAULT_VIDEO_WATCH_THRESHOLD,
  quiz_pass_mark_percent: DEFAULT_QUIZ_PASS_MARK,
  quiz_max_attempts: '',
  questions: [],
});


const toDuration = lesson => {
  const minutes = parseInt(lesson.duration_minutes, 10);
  if (Number.isInteger(minutes) && minutes > 0) return `${minutes} min`;
  return lesson.duration_legacy || null;
};

const toPercent = (value, fallback) => {
  const percent = parseInt(value, 10);
  return Number.isInteger(percent) ? percent : fallback;
};

const toMaxAttempts = value => {
  const attempts = parseInt(value, 10);
  return Number.isInteger(attempts) && attempts > 0 ? attempts : null;
};

const toQuestionPayload = question => ({
  ...withId(question),
  prompt: question.prompt,
  question_type: question.question_type,
  explanation: question.explanation || '',
  options: (question.options || []).map(option => ({
    ...withId(option),
    text: option.text,
    is_correct: Boolean(option.is_correct),
  })),
});

// Quiz lessons send their settings + the full question list; other types omit `questions`, which
// leaves any stored questions untouched (the API only replaces questions when the key is present).
const toQuizPayload = lesson =>
  lesson.lesson_type === 'quiz'
    ? {
        quiz_pass_mark_percent: toPercent(lesson.quiz_pass_mark_percent, DEFAULT_QUIZ_PASS_MARK),
        quiz_max_attempts: toMaxAttempts(lesson.quiz_max_attempts),
        questions: (lesson.questions || []).map(toQuestionPayload),
      }
    : {};

const toLessonPayload = lesson => ({
  ...withId(lesson),
  title: lesson.title,
  lesson_type: lesson.lesson_type,
  content_url:
    URL_LESSON_TYPES.includes(lesson.lesson_type) || MEDIA_LESSON_TYPES.includes(lesson.lesson_type)
      ? lesson.content_url || null
      : null,
  text_content: TEXT_LESSON_TYPES.includes(lesson.lesson_type) ? richTextOrNull(lesson.text_content) : null,
  image: lesson.image || null,
  duration: toDuration(lesson),
  is_required_for_completion: Boolean(lesson.is_required_for_completion),
  // Only meaningful for video; omitted otherwise so the stored value is left untouched.
  ...(lesson.lesson_type === 'video'
    ? { video_watch_threshold_percent: toPercent(lesson.video_watch_threshold_percent, DEFAULT_VIDEO_WATCH_THRESHOLD) }
    : {}),
  ...toQuizPayload(lesson),
});

// The unlock date is only sent for the 'date' rule (local midnight of the picked day).
const toUnlockDate = module =>
  module.unlock_rule === 'date' && module.unlock_date ? dayjs(module.unlock_date).startOf('day').toISOString() : null;

// ---- Granular endpoints (PATCH one module / lesson, PUT one lesson's quiz): each request names only
// the one object it saves. These strip the UI-only fields (`_key`, duration helpers).

// A module's own fields (no id, no lessons).
export const toModuleFieldsPayload = module => ({
  title: module.title,
  description: richTextOrNull(module.description),
  image: module.image || null,
  unlock_rule: module.unlock_rule || 'sequential',
  unlock_date: toUnlockDate(module),
});

// A lesson's own fields (no id, no questions — the quiz is saved by its own endpoint).
export const toLessonFieldsPayload = lesson => {
  const { id, questions, ...fields } = toLessonPayload(lesson);
  return fields;
};

// A quiz lesson's whole question list, as the quiz endpoint expects it.
export const toQuestionsPayload = lesson => (lesson.questions || []).map(toQuestionPayload);

// API → form for the whole curriculum (the program detail response).
export const toModulesFormValues = program =>
  (program?.modules || []).map(module => ({
    ...toModuleFormValues(module),
    lessons: (module.lessons || []).map(toLessonFormValues),
  }));

const isCount = (value, { min, max = Infinity }) => {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max;
};

// Why an edit can't be sent yet (the API would answer 400), or null. Shown next to the item instead
// of silently holding the save back.
export const getModuleProblem = module => (module.title?.trim() ? null : 'Give the module a title.');

// The first thing that stops a lesson's FIELDS from saving, per lesson tab (null = fine). The lesson's
// questions are checked separately (getQuestionProblem) because the quiz has its own save.
export const getLessonFieldProblemsByTab = lesson => {
  let content = null;
  if (!lesson.title?.trim()) content = 'Give the lesson a title.';
  else if (lesson.duration_minutes !== '' && !isCount(lesson.duration_minutes, { min: 0 })) content = 'Duration must be a whole number of minutes.';

  let settings = null;
  if (lesson.lesson_type === 'video' && !isCount(lesson.video_watch_threshold_percent, { min: 0, max: 100 })) {
    settings = 'Watch % to complete must be between 0 and 100.';
  }
  if (lesson.lesson_type === 'quiz') {
    if (!isCount(lesson.quiz_pass_mark_percent, { min: 0, max: 100 })) settings = 'Pass mark must be between 0 and 100.';
    else if (lesson.quiz_max_attempts !== '' && !isCount(lesson.quiz_max_attempts, { min: 1 })) settings = 'Max attempts must be 1 or more.';
  }
  return { content, settings };
};

// "Question 2 — Add the question text." for a quiz's first unfinished question, else null; plus how many
// questions are unfinished.
export const getQuizProblems = lesson => {
  if (lesson.lesson_type !== 'quiz') return { message: null, count: 0 };
  const questions = lesson.questions || [];
  const problems = questions.map(question => getQuestionProblem(question));
  const index = problems.findIndex(Boolean);
  return { message: index === -1 ? null : `Question ${index + 1} — ${problems[index]}`, count: problems.filter(Boolean).length };
};

// Mirrors CertQuizQuestionSerializer.validate — a question the API would reject (400).
export const getQuestionProblem = question => {
  if (!question.prompt?.trim()) return 'Add the question text.';
  const options = question.options || [];
  if (options.length < MIN_QUIZ_OPTIONS || options.some(option => !option.text?.trim())) {
    return `Give it at least ${MIN_QUIZ_OPTIONS} options, all with text.`;
  }
  const correctCount = options.filter(option => option.is_correct).length;
  if (question.question_type === SINGLE_CHOICE && correctCount !== 1) return 'Mark exactly one correct answer.';
  if (question.question_type === MULTIPLE_CHOICE && correctCount < 1) return 'Mark at least one correct answer.';
  return null;
};

// Parallel to a payload: the `_key` of each module/lesson/question/option it was built from, by
// position — so a save response's ids can be adopted by the right items even if the form changed.
export const keysOf = values =>
  (values.modules || []).map(module => ({
    key: module._key,
    lessons: (module.lessons || []).map(lesson => ({
      key: lesson._key,
      questions: (lesson.questions || []).map(question => ({
        key: question._key,
        optionKeys: (question.options || []).map(option => option._key),
      })),
    })),
  }));

const collectSavedIds = (sentKeys, savedModules) => {
  const idsByKey = new Map();
  const remember = (key, saved) => {
    if (key && saved?.id) idsByKey.set(key, saved.id);
  };
  sentKeys.forEach((sentModule, mi) => {
    const savedModule = savedModules[mi];
    remember(sentModule.key, savedModule);
    sentModule.lessons.forEach((sentLesson, li) => {
      const savedLesson = savedModule?.lessons?.[li];
      remember(sentLesson.key, savedLesson);
      // Only quiz lessons send questions, and the response lists them in the order sent.
      sentLesson.questions.forEach((sentQuestion, qi) => {
        const savedQuestion = savedLesson?.questions?.[qi];
        remember(sentQuestion.key, savedQuestion);
        sentQuestion.optionKeys.forEach((optionKey, oi) => remember(optionKey, savedQuestion?.options?.[oi]));
      });
    });
  });
  return idsByKey;
};

// Returns `modules` with server ids filled in for items created by the save whose payload
// `sentKeys` describes.
export const withAdoptedIds = (modules, sentKeys, savedModules) => {
  const idsByKey = collectSavedIds(sentKeys, savedModules);
  const adopt = item => (item.id || !idsByKey.has(item._key) ? item : { ...item, id: idsByKey.get(item._key) });
  return modules.map(module => ({
    ...adopt(module),
    lessons: (module.lessons || []).map(lesson => ({
      ...adopt(lesson),
      questions: (lesson.questions || []).map(question => ({
        ...adopt(question),
        options: (question.options || []).map(adopt),
      })),
    })),
  }));
};
