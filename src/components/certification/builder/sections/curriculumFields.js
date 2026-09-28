import dayjs from 'dayjs';

// Form <-> API mapping for Curriculum Builder modules/lessons, shared by ProgramBuilderModal
// (API -> form, pickModules) and CurriculumBuilderSection (form -> API, toPayload). Every field
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
  content_url: URL_LESSON_TYPES.includes(lesson.lesson_type) ? lesson.content_url || null : null,
  text_content: TEXT_LESSON_TYPES.includes(lesson.lesson_type) ? lesson.text_content || null : null,
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

const hasIncompleteQuiz = values =>
  (values.modules || []).some(module =>
    (module.lessons || []).some(
      lesson => lesson.lesson_type === 'quiz' && (lesson.questions || []).some(question => getQuestionProblem(question))
    )
  );

// Why the curriculum can't be saved right now (the API would reject it), or null when it can.
export const getUnsavableReason = values => {
  if (hasUntitledItems(values)) return 'Give every module and lesson a title — changes save once they’re all named.';
  if (hasIncompleteQuiz(values)) return 'Finish the highlighted quiz questions — changes save once every question is complete.';
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
