import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';
import ImageUploadField from '@/components/certification/builder/ImageUploadField';
import { TEXT_LESSON_TYPES, URL_LESSON_TYPES } from './curriculumFields';
import QuizQuestionsEditor from './QuizQuestionsEditor';

const LESSON_TYPE_OPTIONS = [
  { value: 'video', label: '🎥 Video' },
  { value: 'pdf', label: '📄 PDF' },
  { value: 'text', label: '📝 Text' },
  { value: 'quiz', label: '🧩 Quiz' },
  { value: 'assignment', label: '📤 Assignment' },
  { value: 'link', label: '🔗 Link' },
];
const URL_LABELS = { video: 'Video URL', pdf: 'PDF URL', link: 'Link URL' };
const TEXT_LABELS = { text: 'Text Content', assignment: 'Assignment Instructions' };

// One lesson's editable fields. Text/number inputs save on blur (the section's <Form onBlur>);
// discrete controls (type select, required switch, image) save immediately via onLessonChange.
const CurriculumLessonFields = ({ mi, li, lesson, disabled, onLessonChange, getBlockReason }) => {
  const namePrefix = `modules[${mi}].lessons[${li}]`;
  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
      <FormikSelect
        name={`${namePrefix}.lesson_type`}
        label="Lesson Type"
        options={LESSON_TYPE_OPTIONS}
        disabled={disabled}
        // FormikSelect passes the value; picking the selected option again clears it, which a lesson
        // type can't be — keep the current type then.
        onChange={value => onLessonChange({ lesson_type: value || lesson.lesson_type })}
      />
      <FormikField name={`${namePrefix}.title`} label="Lesson Title" placeholder="e.g. Understanding the menopause transition" disabled={disabled} />

      {URL_LESSON_TYPES.includes(lesson.lesson_type) ? (
        <div className="md:col-span-2">
          <FormikField
            name={`${namePrefix}.content_url`}
            label={URL_LABELS[lesson.lesson_type]}
            placeholder="https://youtube.com/... or https://vimeo.com/..."
            disabled={disabled}
          />
        </div>
      ) : null}
      {TEXT_LESSON_TYPES.includes(lesson.lesson_type) ? (
        <div className="md:col-span-2">
          <FormikField name={`${namePrefix}.text_content`} label={TEXT_LABELS[lesson.lesson_type]} rows={3} disabled={disabled} />
        </div>
      ) : null}
      {lesson.lesson_type === 'quiz' ? (
        <>
          <FormikField name={`${namePrefix}.quiz_pass_mark_percent`} label="Pass mark (%)" type="number" min={0} max={100} disabled={disabled} />
          <FormikField
            name={`${namePrefix}.quiz_max_attempts`}
            label="Max attempts"
            type="number"
            min={1}
            placeholder="Unlimited"
            disabled={disabled}
          />
          <QuizQuestionsEditor
            namePrefix={namePrefix}
            questions={lesson.questions}
            disabled={disabled}
            onQuestionsChange={questions => onLessonChange({ questions })}
          />
        </>
      ) : null}

      <FormikField name={`${namePrefix}.duration_minutes`} label="Duration (minutes)" type="number" min={0} placeholder="e.g. 12" disabled={disabled} />
      {lesson.lesson_type === 'video' ? (
        <FormikField
          name={`${namePrefix}.video_watch_threshold_percent`}
          label="Watch % to complete"
          type="number"
          min={0}
          max={100}
          disabled={disabled}
        />
      ) : (
        <div className="hidden md:block" />
      )}

      <FormikSwitch
        name={`${namePrefix}.is_required_for_completion`}
        label="Required for completion"
        description="Counts toward progress and unlocking the next module"
        disabled={disabled}
        onChange={event => onLessonChange({ is_required_for_completion: event.target.checked })}
      />
      <ImageUploadField
        label="Lesson Image"
        value={lesson.image}
        disabled={disabled}
        getBlockReason={getBlockReason}
        onChange={image => onLessonChange({ image })}
      />
    </div>
  );
};

export default CurriculumLessonFields;
