'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/loader/PageLoader';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { getCertificationLessonQuiz, submitCertificationLessonQuiz } from '@/services/private/certification/catalog';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { CompletedBadge, invalidateLearnerProgress } from '../MarkAsDoneButton';

const SINGLE_CHOICE = 'single_choice';

const attemptsLabel = quiz =>
  quiz.attempts_remaining === null ? 'Unlimited attempts' : `${quiz.attempts_remaining} of ${quiz.max_attempts} attempts left`;

// One question in "taking" mode — option buttons in the LMSQuizDetails style; radio behaviour for
// single choice, toggles for multiple choice.
const QuestionCard = ({ index, question, selected, onToggle }) => (
  <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-5 dark:border-strokedark">
    <p className="font-semibold text-gray-900 dark:text-white">
      {index + 1}. {question.prompt}
    </p>
    <p className="text-xs text-gray-500">{question.question_type === SINGLE_CHOICE ? 'Choose one answer' : 'Choose all that apply'}</p>
    <div className="flex flex-col gap-2">
      {question.options.map(option => {
        const isSelected = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            role={question.question_type === SINGLE_CHOICE ? 'radio' : 'checkbox'}
            aria-checked={isSelected}
            onClick={() => onToggle(question, option.id)}
            className={`w-full rounded-md border p-3 text-left hover:border-primary ${
              isSelected ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-strokedark'
            }`}
          >
            {option.text}
          </button>
        );
      })}
    </div>
  </div>
);

// Result for one question: the learner's answer, right/wrong, explanation, and the correct
// answer(s) only when the server included them (passed, or no attempts left).
const QuestionResult = ({ index, question, result }) => {
  const optionText = ids => question.options.filter(option => ids.includes(option.id)).map(option => option.text).join(', ');
  const Icon = result.answered_correctly ? FaCheckCircle : FaTimesCircle;
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 dark:border-strokedark">
      <p className="flex items-start gap-2 font-semibold text-gray-900 dark:text-white">
        <Icon className={`mt-1 shrink-0 ${result.answered_correctly ? 'text-green-600' : 'text-red-500'}`} />
        {index + 1}. {question.prompt}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Your answer: {result.selected_option_ids.length ? optionText(result.selected_option_ids) : 'No answer'}
      </p>
      {result.correct_option_ids ? (
        <p className="text-sm text-green-700 dark:text-green-400">Correct answer: {optionText(result.correct_option_ids)}</p>
      ) : null}
      {result.explanation ? <p className="text-sm text-gray-500">{result.explanation}</p> : null}
    </div>
  );
};

const QuizResult = ({ quiz, attempt, onRetry }) => {
  const resultsById = new Map(attempt.results.map(result => [result.question_id, result]));
  const canRetry = !attempt.passed && quiz.attempts_remaining !== 0;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-800">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">{Math.round(attempt.score_percent)}%</span>
        <span className={`rounded-full px-3 py-1 text-sm font-medium text-white ${attempt.passed ? 'bg-primary' : 'bg-red-500'}`}>
          {attempt.passed ? 'Passed' : 'Not passed'}
        </span>
        <span className="text-sm text-gray-500">
          Pass mark {quiz.pass_mark_percent}% · {attemptsLabel(quiz)}
          {quiz.best_score_percent !== null ? ` · Best ${Math.round(quiz.best_score_percent)}%` : ''}
        </span>
      </div>
      {quiz.questions.map((question, index) =>
        resultsById.has(question.id) ? (
          <QuestionResult key={question.id} index={index} question={question} result={resultsById.get(question.id)} />
        ) : null
      )}
      {attempt.passed ? <CompletedBadge /> : null}
      {canRetry ? (
        <Button className="self-start" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
      {!attempt.passed && quiz.attempts_remaining === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">You&apos;ve used all your attempts for this quiz.</p>
      ) : null}
    </div>
  );
};

/**
 * Certification quiz lesson: multi-question, graded on the server. Revisiting a passed quiz (or
 * one with no attempts left) shows the last result instead of a fresh attempt.
 */
const CertQuizLesson = ({ lesson, programId }) => {
  const queryClient = useQueryClient();
  const [selections, setSelections] = useState({}); // { [questionId]: optionId[] }
  const [isRetrying, setIsRetrying] = useState(false);

  const quizQuery = useQuery({
    queryFn: () => getCertificationLessonQuiz({ programId, lessonId: lesson.id }),
    queryKey: [queryKeys.certificationLessonQuiz, programId, lesson.id],
    retry: false,
  });
  useHandleApiResponse(quizQuery.failureReason);

  const { mutateAsync: submitQuiz, isPending: isSubmitting } = useMutation({ mutationFn: submitCertificationLessonQuiz });

  if (quizQuery.isLoading) return <PageLoader />;
  const quiz = quizQuery.data?.data;
  if (!quiz) return <p className="p-8 text-center text-gray-500">This quiz isn&apos;t available.</p>;
  if (quiz.questions.length === 0) return <p className="p-8 text-center text-gray-500">This quiz has no questions yet.</p>;

  const lastAttempt = quiz.last_attempt;
  const showResult = lastAttempt && !isRetrying;
  if (showResult) {
    return (
      <QuizResult
        quiz={quiz}
        attempt={lastAttempt}
        onRetry={() => {
          setSelections({});
          setIsRetrying(true);
        }}
      />
    );
  }

  const toggleOption = (question, optionId) =>
    setSelections(current => {
      const selected = current[question.id] || [];
      if (question.question_type === SINGLE_CHOICE) return { ...current, [question.id]: [optionId] };
      const next = selected.includes(optionId) ? selected.filter(id => id !== optionId) : [...selected, optionId];
      return { ...current, [question.id]: next };
    });

  const unanswered = quiz.questions.filter(question => !(selections[question.id] || []).length).length;

  const handleSubmit = async () => {
    try {
      await submitQuiz({ programId, lessonId: lesson.id, answers: selections });
      await Promise.all([
        queryClient.invalidateQueries([queryKeys.certificationLessonQuiz, programId, lesson.id]),
        invalidateLearnerProgress(queryClient, programId),
      ]);
      setIsRetrying(false);
    } catch (error) {
      toastApiError(error);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {quiz.questions.length} questions · Pass mark {quiz.pass_mark_percent}% · {attemptsLabel(quiz)}
      </p>
      {quiz.questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          index={index}
          question={question}
          selected={selections[question.id] || []}
          onToggle={toggleOption}
        />
      ))}
      <div className="flex flex-col items-start gap-1">
        <Button size="xl" isLoading={isSubmitting} disabled={isSubmitting || unanswered > 0 || !quiz.can_attempt} onClick={handleSubmit}>
          {isSubmitting ? 'Submitting' : 'Submit answers'}
        </Button>
        {unanswered > 0 ? <span className="text-xs text-gray-500">Answer all {unanswered} remaining question(s) to submit.</span> : null}
      </div>
    </div>
  );
};

export default CertQuizLesson;
