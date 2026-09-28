import Image from 'next/image';
import { getLessonType } from './lessonTypes';

// Lesson thumbnail: the creator's image when set, otherwise a per-type tinted tile + icon, so
// cards are distinguishable instead of all sharing one placeholder image.
const LessonTypeTile = ({ lesson, className = '' }) => {
  const { icon: Icon, tileClassName } = getLessonType(lesson.lesson_type);

  if (lesson.image) {
    return (
      <Image
        width={0}
        height={0}
        sizes="100vw"
        src={lesson.image}
        alt={lesson.title || 'Lesson image'}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`w-full h-full flex items-center justify-center ${tileClassName} ${className}`}>
      <Icon size={48} />
    </div>
  );
};

export default LessonTypeTile;
