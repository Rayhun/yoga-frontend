import ControllableRichText from '@/components/common/details/ControllableRichText';
import MarkAsDoneButton from '../MarkAsDoneButton';

const TextLesson = ({ lesson, programId }) => (
  <div className="flex flex-col gap-6">
    <ControllableRichText showFullText className="prose max-w-none dark:text-white">
      {lesson.text_content || 'This reading isn’t available yet.'}
    </ControllableRichText>
    <MarkAsDoneButton programId={programId} lesson={lesson} />
  </div>
);

export default TextLesson;
