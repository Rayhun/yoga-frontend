'use client';
import { useState } from 'react';
import { FaExternalLinkAlt, FaLink } from 'react-icons/fa';
import MarkAsDoneButton from '../MarkAsDoneButton';

const getDomain = url => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (error) {
    return url;
  }
};

// "Mark as done" unlocks once the learner has opened the link (in this visit), or if already done.
const LinkLesson = ({ lesson, programId }) => {
  const [hasOpened, setHasOpened] = useState(false);

  if (!lesson.content_url) {
    return <p className="p-8 text-center text-gray-500">This link isn&apos;t available yet.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-5 dark:border-strokedark">
        <div className="rounded-full bg-sky-50 p-4 text-sky-500">
          <FaLink size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 dark:text-white line-clamp-2">{lesson.title}</p>
          <p className="text-sm text-gray-500 truncate">{getDomain(lesson.content_url)}</p>
        </div>
        <a
          href={lesson.content_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setHasOpened(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary/80"
        >
          Open link <FaExternalLinkAlt size={12} />
        </a>
      </div>
      <MarkAsDoneButton
        programId={programId}
        lesson={lesson}
        disabled={!hasOpened}
        disabledHint="Open the link first, then mark it as done."
      />
    </div>
  );
};

export default LinkLesson;
