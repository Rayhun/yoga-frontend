import { getQuestionProblem } from '@/components/certification/builder/sections/curriculumFields';

// Per-item state for the curriculum outline badges, derived from the same rules that gate saving
// (`getQuestionProblem`) plus the 409 blocked notices, which are keyed by server id.

const isUntitled = item => !item.title?.trim();

export const countQuizProblems = lesson =>
  lesson.lesson_type === 'quiz' ? (lesson.questions || []).filter(question => getQuestionProblem(question)).length : 0;

export const getLessonStatus = (lesson, blockedNotices) => ({
  untitled: isUntitled(lesson),
  quizProblems: countQuizProblems(lesson),
  blocked: Boolean(lesson.id && blockedNotices?.byLesson?.get(lesson.id)),
});

// A module's badge also reflects its lessons, so a collapsed module still shows there's work inside.
export const getModuleStatus = (module, blockedNotices) => {
  const lessonStatuses = (module.lessons || []).map(lesson => getLessonStatus(lesson, blockedNotices));
  return {
    untitled: isUntitled(module),
    blocked: Boolean(module.id && blockedNotices?.byModule?.get(module.id)),
    lessonIssueCount: lessonStatuses.filter(status => status.untitled || status.quizProblems > 0).length,
    lessonBlockedCount: lessonStatuses.filter(status => status.blocked).length,
  };
};
