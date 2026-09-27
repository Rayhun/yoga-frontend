import ControllableRichText from '@/components/common/details/ControllableRichText';
import { getLessonType } from '../lessonTypes';

const COPY = {
  quiz: 'Quizzes are coming soon — you’ll be able to take this quiz here.',
  assignment: 'Assignment submissions are coming soon — you’ll be able to submit your work here for review.',
};

// Quiz / assignment placeholder until their own flows ship; an assignment still shows its instructions.
const ComingSoonLesson = ({ lesson }) => {
  const { icon: Icon, tileClassName } = getLessonType(lesson.lesson_type);

  return (
    <div className="flex flex-col gap-6">
      {lesson.lesson_type === 'assignment' && lesson.text_content ? (
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-gray-900 dark:text-white">Instructions</h4>
          <ControllableRichText showFullText className="dark:text-white">{lesson.text_content}</ControllableRichText>
        </div>
      ) : null}
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <div className={`rounded-full p-4 ${tileClassName}`}>
          <Icon size={28} />
        </div>
        <p className="max-w-md text-gray-600 dark:text-gray-300">{COPY[lesson.lesson_type]}</p>
      </div>
    </div>
  );
};

export default ComingSoonLesson;
