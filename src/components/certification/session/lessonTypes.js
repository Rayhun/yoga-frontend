import { FaBookOpen, FaClipboardList, FaFilePdf, FaLink, FaPlayCircle } from 'react-icons/fa';
import { MdQuiz } from 'react-icons/md';

// Per-type display config for certification lessons (CertLesson.lesson_type) — cards, side panel,
// and the lesson page all read from here so labels/icons stay consistent.
export const LESSON_TYPES = {
  video: { label: 'Video', icon: FaPlayCircle, tileClassName: 'bg-rose-50 text-rose-500' },
  pdf: { label: 'PDF', icon: FaFilePdf, tileClassName: 'bg-red-50 text-red-500' },
  link: { label: 'Link', icon: FaLink, tileClassName: 'bg-sky-50 text-sky-500' },
  text: { label: 'Reading', icon: FaBookOpen, tileClassName: 'bg-emerald-50 text-emerald-600' },
  quiz: { label: 'Quiz', icon: MdQuiz, tileClassName: 'bg-purple-50 text-purple-500' },
  assignment: { label: 'Assignment', icon: FaClipboardList, tileClassName: 'bg-amber-50 text-amber-600' },
};

const FALLBACK_TYPE = { label: 'Lesson', icon: FaBookOpen, tileClassName: 'bg-gray-100 text-gray-500' };

export const getLessonType = lessonType => LESSON_TYPES[lessonType] || FALLBACK_TYPE;

// "Video · 12 min" — duration only when the creator set one; never renders "null".
export const getLessonMetaLabel = ({ lesson_type: lessonType, duration }) => {
  const { label } = getLessonType(lessonType);
  const trimmedDuration = typeof duration === 'string' ? duration.trim() : '';
  return trimmedDuration ? `${label} · ${trimmedDuration}` : label;
};

export const getLessonHref = (lessonId, programId) =>
  `/portal/customer/certification/session/${lessonId}/details?program=${programId}`;

// Types a learner completes with an explicit "Mark as done" (the backend rejects quiz/assignment,
// and video completes itself once the watch threshold is reached).
export const MANUALLY_COMPLETABLE_TYPES = ['link', 'pdf', 'text'];
