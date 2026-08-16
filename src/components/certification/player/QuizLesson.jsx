'use client';
import PendingReviewBadge from './PendingReviewBadge';

/**
 * "Submit for review" handoff only (backend plan KAN-93 scope) — the API deliberately doesn't
 * expose quiz question/option data to the learner-portal content endpoint this pass, so there's
 * no question-answering UI here, just the submission action and its resulting state.
 */
const QuizLesson = ({ lesson, onComplete, isSubmitting }) => {
  const gradingStatus = lesson.progress?.grading_status;

  if (gradingStatus === 'pending_review') return <PendingReviewBadge />;

  if (gradingStatus === 'graded') {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-gray-800">Score: {lesson.progress.coach_score}</p>
        {lesson.progress.coach_feedback ? <p className="text-sm text-gray-600">{lesson.progress.coach_feedback}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-600">{lesson.quiz?.title || 'Complete this quiz to continue.'}</p>
      <button
        onClick={() => onComplete({ answers: {} })}
        disabled={isSubmitting}
        className="w-fit py-2.5 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-colors disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting…' : 'Submit for review'}
      </button>
    </div>
  );
};

export default QuizLesson;
