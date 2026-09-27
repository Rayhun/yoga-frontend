'use client';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import LinearProgress from '@mui/material/LinearProgress';
import { BiCheck } from 'react-icons/bi';
import { FiLock } from 'react-icons/fi';
import LessonTypeTile from '@/components/certification/session/LessonTypeTile';
import { getLessonHref, getLessonMetaLabel, getLessonType } from '@/components/certification/session/lessonTypes';

const DEFAULT_LOCK_MESSAGE = 'This content is not yet available. It will unlock as you progress through the program.';

const getHref = (item, programId) =>
  item.content_type === 'module'
    ? `/portal/customer/certification/module/${item.id}/details?program=${programId}`
    : getLessonHref(item.id, programId);

const ModuleContent = ({ totalItems = 0, completedItems = 0 }) => {
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  return (
    <div className="flex flex-col gap-2 mb-2">
      <p className="text-bodydark2 text-sm">
        {completedItems}/{totalItems} completed
      </p>
      <LinearProgress color="secondary" className="rounded-full" value={progress} />
    </div>
  );
};

const LessonContent = ({ lesson }) => {
  const { icon: Icon } = getLessonType(lesson.lesson_type);
  return (
    <div className="flex gap-2 items-center">
      <Icon size={20} className="text-secondary" />
      <p className="text-bodydark2 text-md">{getLessonMetaLabel(lesson)}</p>
    </div>
  );
};

/**
 * Card for a module (content_type 'module') or a lesson (content_type 'lesson', with lesson_type).
 * `locked` comes from the API (module.is_locked); `lock_reason` is the server's explanation.
 */
const ContentCard = ({ item, isEnrolled = false, programId }) => {
  const params = useParams();
  const router = useRouter();
  const isModule = item.content_type === 'module';
  const isLocked = Boolean(item?.locked);

  const handleNavigate = () => {
    if (!isEnrolled) {
      toast.error('Please enroll in this program to access the content');
      return;
    }
    if (isLocked) {
      toast.info(item.lock_reason || DEFAULT_LOCK_MESSAGE);
      return;
    }
    router.push(getHref(item, programId || params.id));
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg transition cursor-pointer ${
        isLocked ? 'opacity-90 hover:shadow-lg' : 'hover:shadow-xl'
      }`}
      onClick={handleNavigate}
    >
      {/* Image */}
      <div className="relative">
        <div className={`aspect-[16/9] overflow-hidden rounded-t-lg ${isLocked ? 'grayscale' : ''}`}>
          {isModule ? (
            <Image
              width={0}
              height={0}
              src={item.image || '/images/content/default.png'}
              alt={item.title || 'Module image'}
              sizes="100vw"
              className="w-full h-full object-cover"
            />
          ) : (
            <LessonTypeTile lesson={item} />
          )}
        </div>
        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-t-lg bg-black/40">
            <div className="rounded-full bg-white/90 dark:bg-gray-800/90 p-3 shadow-lg">
              <FiLock size={32} className="text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        )}
        {/* Completion or Lock badge */}
        {isLocked ? (
          <div className="absolute -bottom-4 left-2 bg-white dark:bg-gray-700 rounded-full p-1 shadow-lg">
            <FiLock size={24} className="text-gray-500 dark:text-gray-400" />
          </div>
        ) : item.completed ? (
          <div className="absolute -bottom-4 left-2 bg-white rounded-full p-1 shadow-lg">
            <BiCheck size={24} className="bg-secondary rounded-full text-white" />
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col justify-between h-[110px]">
        <h2 className={`text-lg font-bold line-clamp-1 ${isLocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
          {item.title}
          {isLocked && <span className="ml-1 text-sm font-normal">(Locked)</span>}
        </h2>

        {isModule ? (
          <ModuleContent
            totalItems={item.total_count ?? item.lesson_count ?? 0}
            completedItems={item.completed_count ?? 0}
          />
        ) : (
          <LessonContent lesson={item} />
        )}
      </div>
    </div>
  );
};

export default ContentCard;
