'use client';
import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik, Form } from 'formik';
import { toast } from 'react-toastify';
import { FaPaperclip } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import PageLoader from '@/components/common/loader/PageLoader';
import ControllableRichText from '@/components/common/details/ControllableRichText';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { uploadCertificationFile } from '@/services/private/certification/application';
import {
  getCertificationLessonAssignment,
  submitCertificationLessonAssignment,
} from '@/services/private/certification/catalog';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import SubmissionContent, { SubmissionStatusBadge } from '@/components/certification/grading/SubmissionContent';
import { CompletedBadge, invalidateLearnerProgress } from '../MarkAsDoneButton';

const escapeHtml = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Plain textarea → paragraphs (the answer is stored and shown as sanitized HTML).
const toParagraphs = text =>
  text
    .trim()
    .split(/\n{2,}/)
    .map(paragraph => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');

const FeedbackBox = ({ submission }) =>
  submission?.coach_feedback ? (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Coach feedback</p>
      <p className="whitespace-pre-line text-sm text-gray-800 dark:text-gray-200">{submission.coach_feedback}</p>
    </div>
  ) : null;

const SubmitForm = ({ programId, lessonId, isResubmission }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null); // { key, name }
  const [isUploading, setIsUploading] = useState(false);
  const { mutateAsync: submit, isPending } = useMutation({ mutationFn: submitCertificationLessonAssignment });

  const handleFile = async event => {
    const picked = event.target.files?.[0];
    event.target.value = '';
    if (!picked) return;
    setIsUploading(true);
    try {
      const { data } = await uploadCertificationFile({ file: picked });
      if (!data?.file_key) throw new Error('Upload did not return a file key.');
      setFile({ key: data.file_key, name: picked.name });
    } catch (error) {
      toastApiError(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async values => {
    const payload = {
      text_answer: values.text_answer.trim() ? toParagraphs(values.text_answer) : null,
      file_key: file?.key || null,
      link_url: values.link_url.trim() || null,
    };
    if (!payload.text_answer && !payload.file_key && !payload.link_url) {
      toast.error('Add a written answer, a file, or a link.');
      return;
    }
    try {
      await submit({ programId, lessonId, payload });
      await Promise.all([
        queryClient.invalidateQueries([queryKeys.certificationLessonAssignment, programId, lessonId]),
        invalidateLearnerProgress(queryClient, programId),
      ]);
      toast.success('Submitted for review');
    } catch (error) {
      toastApiError(error);
    }
  };

  return (
    <Formik initialValues={{ text_answer: '', link_url: '' }} onSubmit={handleSubmit}>
      <Form className="flex flex-col gap-4 rounded-lg border border-gray-200 p-5 dark:border-strokedark">
        <h4 className="font-semibold text-gray-900 dark:text-white">{isResubmission ? 'Submit a revised version' : 'Your submission'}</h4>
        <FormikField name="text_answer" label="Written answer" rows={6} placeholder="Type your answer here" />
        <div className="flex flex-col gap-1">
          <span className="font-medium text-black dark:text-white">File</span>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:border-primary disabled:opacity-50 dark:border-strokedark"
            >
              <FaPaperclip /> {isUploading ? 'Uploading…' : file ? 'Replace file' : 'Attach a file'}
            </button>
            {file ? (
              <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                {file.name}
                <button type="button" aria-label="Remove file" onClick={() => setFile(null)} className="text-gray-500 hover:text-red-500">
                  <MdClose />
                </button>
              </span>
            ) : null}
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />
          </div>
        </div>
        <FormikField name="link_url" label="Link" placeholder="https://docs.google.com/..." />
        <Button type="submit" className="self-start" isLoading={isPending} disabled={isPending || isUploading}>
          Submit for review
        </Button>
      </Form>
    </Formik>
  );
};

/**
 * Assignment lesson: instructions, the learner's submission + status, coach feedback, and a
 * (re)submit form when allowed — reviewed manually by the program's creator in the Grading Queue.
 */
const AssignmentLesson = ({ lesson, programId }) => {
  const assignmentQuery = useQuery({
    queryFn: () => getCertificationLessonAssignment({ programId, lessonId: lesson.id }),
    queryKey: [queryKeys.certificationLessonAssignment, programId, lesson.id],
    retry: false,
  });
  useHandleApiResponse(assignmentQuery.failureReason);

  if (assignmentQuery.isLoading) return <PageLoader />;
  const state = assignmentQuery.data?.data;
  if (!state) return <p className="p-8 text-center text-gray-500">This assignment isn&apos;t available.</p>;
  const { current } = state;

  return (
    <div className="flex flex-col gap-6">
      {state.instructions ? (
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-gray-900 dark:text-white">Instructions</h4>
          <ControllableRichText showFullText className="dark:text-white">{state.instructions}</ControllableRichText>
        </div>
      ) : null}

      {current ? (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-5 dark:border-strokedark">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">Your latest submission</h4>
            <SubmissionStatusBadge status={current.status} />
          </div>
          <SubmissionContent submission={current} />
          <FeedbackBox submission={current} />
          {current.status === 'pending' ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">Your coach will review it soon — you&apos;ll see their feedback here.</p>
          ) : null}
          {current.status === 'passed' ? <CompletedBadge /> : null}
        </div>
      ) : null}

      {state.can_submit ? (
        <SubmitForm programId={programId} lessonId={lesson.id} isResubmission={Boolean(current)} />
      ) : null}

      {state.history.length ? (
        <details className="rounded-lg border border-gray-200 p-4 dark:border-strokedark">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
            Earlier submissions ({state.history.length})
          </summary>
          <div className="mt-3 flex flex-col gap-4">
            {state.history.map(submission => (
              <div key={submission.id} className="flex flex-col gap-2 border-t border-gray-100 pt-3 dark:border-strokedark">
                <SubmissionStatusBadge status={submission.status} />
                <SubmissionContent submission={submission} />
                <FeedbackBox submission={submission} />
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
};

export default AssignmentLesson;
