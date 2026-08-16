'use client';
import { FaFilePdf, FaLink } from 'react-icons/fa';
import { BiCheckCircle } from 'react-icons/bi';

const TextPdfLinkLesson = ({ lesson, onComplete, isSubmitting }) => {
  const isCompleted = Boolean(lesson.progress?.completed_at);

  return (
    <div className="flex flex-col gap-4">
      {lesson.lesson_type === 'text' && lesson.text_content ? (
        <div className="prose max-w-none text-gray-700 whitespace-pre-line">{lesson.text_content}</div>
      ) : null}

      {(lesson.lesson_type === 'pdf' || lesson.lesson_type === 'link') && lesson.content_url ? (
        <a
          href={lesson.content_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 w-fit px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {lesson.lesson_type === 'pdf' ? <FaFilePdf /> : <FaLink />}
          {lesson.lesson_type === 'pdf' ? 'Open PDF' : 'Open link'}
        </a>
      ) : null}

      <button
        onClick={() => onComplete({})}
        disabled={isCompleted || isSubmitting}
        className={`w-fit py-2.5 px-6 rounded-xl font-semibold text-sm transition-colors ${
          isCompleted
            ? 'bg-green-50 text-green-700 cursor-default'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 disabled:opacity-60'
        }`}
      >
        {isCompleted ? (
          <span className="inline-flex items-center gap-1.5">
            <BiCheckCircle /> Marked as read
          </span>
        ) : isSubmitting ? (
          'Saving…'
        ) : (
          'Mark as read'
        )}
      </button>
    </div>
  );
};

export default TextPdfLinkLesson;
