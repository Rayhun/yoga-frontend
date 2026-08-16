'use client';
import { useState } from 'react';
import PendingReviewBadge from './PendingReviewBadge';

const AssignmentLesson = ({ lesson, onComplete, isSubmitting }) => {
  const [submissionUrl, setSubmissionUrl] = useState('');
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
      {lesson.text_content ? <p className="text-sm text-gray-600 whitespace-pre-line">{lesson.text_content}</p> : null}
      <input
        type="url"
        value={submissionUrl}
        onChange={e => setSubmissionUrl(e.target.value)}
        placeholder="Paste your submission link"
        className="w-full max-w-md rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button
        onClick={() => onComplete({ submission_url: submissionUrl })}
        disabled={isSubmitting || !submissionUrl}
        className="w-fit py-2.5 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-colors disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting…' : 'Submit for review'}
      </button>
    </div>
  );
};

export default AssignmentLesson;
