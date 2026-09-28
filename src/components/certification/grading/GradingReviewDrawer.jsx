'use client';
import { useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import { MdClose } from 'react-icons/md';
import Button from '@/components/common/Button';
import ControllableRichText from '@/components/common/details/ControllableRichText';
import SubmissionContent, { SubmissionStatusBadge } from './SubmissionContent';

const Detail = ({ label, children }) => (
  <div className="py-2 border-b border-gray-100 last:border-0 dark:border-strokedark">
    <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
    <div className="text-sm text-gray-800 break-words dark:text-gray-200">{children}</div>
  </div>
);

/**
 * Review panel for one assignment submission (KAN-96 "GradingReviewDrawer"): learner + lesson
 * context, the instructions, the submission itself, and Pass / Needs revision with feedback
 * (required for revision — the learner needs to know what to change).
 */
const GradingReviewDrawer = ({ submission, isSubmitting, onClose, onGrade }) => {
  const [decision, setDecision] = useState(null); // 'passed' | 'needs_revision'
  const [feedback, setFeedback] = useState('');
  const isPending = submission?.status === 'pending';

  useEffect(() => {
    setDecision(null);
    setFeedback('');
  }, [submission?.id]);

  const feedbackMissing = decision === 'needs_revision' && !feedback.trim();

  return (
    <Drawer anchor="right" open={Boolean(submission)} onClose={onClose}>
      {submission ? (
        <div className="w-[480px] max-w-[95vw] h-full flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Review submission</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-800">
              <MdClose size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            <div>
              <Detail label="Learner">
                {submission.learner_name} <span className="text-gray-500">({submission.learner_email})</span>
              </Detail>
              <Detail label="Program">{submission.program_title}</Detail>
              <Detail label="Lesson">
                {submission.module_title} › {submission.lesson_title}
              </Detail>
              <Detail label="Submitted">
                {new Date(submission.submitted_at).toLocaleString()} · attempt {submission.attempt_number}
              </Detail>
              <Detail label="Status">
                <SubmissionStatusBadge status={submission.status} />
              </Detail>
            </div>

            {submission.instructions ? (
              <details className="rounded-md border border-gray-200 p-3">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">Assignment instructions</summary>
                <ControllableRichText showFullText className="mt-2 text-sm">{submission.instructions}</ControllableRichText>
              </details>
            ) : null}

            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-gray-800">Submission</h3>
              <SubmissionContent submission={submission} />
            </div>

            {isPending ? (
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-gray-800">Your review</h3>
                <div className="flex gap-2" role="radiogroup" aria-label="Decision">
                  {[
                    { value: 'passed', label: 'Pass', active: 'bg-green-700 text-white border-green-700' },
                    { value: 'needs_revision', label: 'Needs revision', active: 'bg-red-600 text-white border-red-600' },
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={decision === option.value}
                      onClick={() => setDecision(option.value)}
                      className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium ${
                        decision === option.value ? option.active : 'border-gray-300 text-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-gray-700">
                    Feedback {decision === 'needs_revision' ? '(required)' : '(optional)'}
                  </span>
                  <textarea
                    value={feedback}
                    onChange={event => setFeedback(event.target.value)}
                    rows={5}
                    placeholder={decision === 'needs_revision' ? 'What should the learner change?' : 'Anything you want the learner to know'}
                    className="rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none"
                  />
                </label>
                {feedbackMissing ? <p className="text-xs text-red-600">Tell the learner what to revise.</p> : null}
              </div>
            ) : submission.coach_feedback ? (
              <Detail label="Feedback given">{submission.coach_feedback}</Detail>
            ) : null}
          </div>

          {isPending ? (
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                isLoading={isSubmitting}
                disabled={!decision || feedbackMissing || isSubmitting}
                onClick={() => onGrade({ passed: decision === 'passed', feedback: feedback.trim() })}
              >
                Submit review
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </Drawer>
  );
};

export default GradingReviewDrawer;
