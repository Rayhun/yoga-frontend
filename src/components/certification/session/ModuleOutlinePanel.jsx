import Link from 'next/link';
import LinearProgress from '@mui/material/LinearProgress';
import { BiCheck } from 'react-icons/bi';
import { FiLock } from 'react-icons/fi';
import { getLessonHref, getLessonMetaLabel } from './lessonTypes';

// "Module Progress" + "Module Navigation" side panel (LMS module page layout), shared by the
// module page and the lesson page. No NaN%: an empty module shows 0%.
const ModuleOutlinePanel = ({ module, programId, currentLessonId }) => {
  const lessons = module?.lessons || [];
  const completedCount = lessons.filter(lesson => lesson.is_completed).length;
  const progress = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const isLocked = Boolean(module?.is_locked);

  return (
    <div className="w-full md:w-1/4 flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg text-primary font-bold">Module Progress</h3>
        <LinearProgress className="rounded-full !h-2" value={progress} />
        <span className="text-sm text-right dark:text-white">{progress}% Complete</span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg text-primary font-bold">Module Navigation</h3>
        {lessons.length === 0 ? (
          <p className="text-sm text-gray-500">No lessons in this module yet.</p>
        ) : (
          <ol className="relative p-5 border-s-4 border-gray-200 dark:border-gray-700">
            {lessons.map(lesson => {
              const isCurrent = String(lesson.id) === String(currentLessonId);
              return (
                <li key={lesson.id} className="ms-6 mb-6">
                  <div className="absolute -start-4 bg-white rounded-full p-1 shadow-lg dark:bg-gray-800">
                    {isLocked ? (
                      <FiLock size={20} className="text-gray-500" />
                    ) : (
                      <BiCheck
                        size={20}
                        className={`rounded-full text-white ${lesson.is_completed ? 'bg-secondary' : 'bg-white dark:bg-gray-600'}`}
                      />
                    )}
                  </div>
                  <Link
                    href={getLessonHref(lesson.id, programId)}
                    className={`block mb-1 text-md font-semibold hover:text-primary ${
                      isCurrent ? 'text-primary' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {lesson.title}
                  </Link>
                  <span className="text-xs text-gray-500">{getLessonMetaLabel(lesson)}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
};

export default ModuleOutlinePanel;
