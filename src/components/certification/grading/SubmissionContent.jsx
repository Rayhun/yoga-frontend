import { FaExternalLinkAlt, FaPaperclip } from 'react-icons/fa';
import ControllableRichText from '@/components/common/details/ControllableRichText';

export const SUBMISSION_STATUS = {
  pending: { label: 'Waiting for review', className: 'bg-amber-100 text-amber-800' },
  needs_revision: { label: 'Needs revision', className: 'bg-red-100 text-red-800' },
  passed: { label: 'Passed', className: 'bg-green-100 text-green-800' },
};

export const SubmissionStatusBadge = ({ status }) => {
  const info = SUBMISSION_STATUS[status];
  if (!info) return null;
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${info.className}`}>{info.label}</span>;
};

// What a learner handed in: written answer, file (fresh signed URL from the API) and/or link.
// Shared by the learner's assignment view and the coach's review drawer.
const SubmissionContent = ({ submission }) => (
  <div className="flex flex-col gap-3">
    {submission.text_answer ? (
      <ControllableRichText showFullText className="rounded-md border border-gray-200 p-3 text-sm dark:border-strokedark dark:text-white">
        {submission.text_answer}
      </ControllableRichText>
    ) : null}
    {submission.file_url ? (
      <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
        <FaPaperclip /> {submission.file_name || 'Attached file'}
      </a>
    ) : null}
    {submission.link_url ? (
      <a href={submission.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 break-all text-sm text-primary hover:underline">
        <FaExternalLinkAlt size={12} /> {submission.link_url}
      </a>
    ) : null}
  </div>
);

export default SubmissionContent;
