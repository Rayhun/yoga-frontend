import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getLessonHref } from './lessonTypes';

const PagerLink = ({ item, programId, direction }) => {
  if (!item) return <span />;
  const isPrevious = direction === 'previous';
  return (
    <Link
      href={getLessonHref(item.lesson.id, programId)}
      className={`flex max-w-[48%] items-center gap-2 rounded-md border border-gray-200 px-4 py-3 hover:border-primary dark:border-strokedark ${
        isPrevious ? '' : 'ml-auto text-right'
      }`}
    >
      {isPrevious ? <FiChevronLeft className="shrink-0" /> : null}
      <span className="flex min-w-0 flex-col">
        <span className="text-xs text-gray-500">{isPrevious ? 'Previous' : 'Next'}</span>
        <span className="truncate font-medium text-gray-900 dark:text-white">{item.lesson.title}</span>
      </span>
      {isPrevious ? null : <FiChevronRight className="shrink-0" />}
    </Link>
  );
};

const LessonPager = ({ previous, next, programId }) => (
  <div className="flex items-center justify-between gap-4">
    <PagerLink item={previous} programId={programId} direction="previous" />
    <PagerLink item={next} programId={programId} direction="next" />
  </div>
);

export default LessonPager;
