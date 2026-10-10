'use client';
import React from 'react';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSwitch from '@/components/common/form/formik/FormikSwitch';
import ImageUploadField from '@/components/certification/builder/ImageUploadField';

/**
 * "Settings" tab: whether the lesson counts toward completion, the type-specific rule (watch % for a
 * video; pass mark and attempts for a quiz) and the lesson image. Two inputs for most types, three for
 * a video, four for a quiz. Same single-form field names as the Content tab.
 */
const LessonSettingsFields = ({ namePrefix, lesson, disabled, onLessonChange }) => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
    <FormikSwitch
      name={`${namePrefix}.is_required_for_completion`}
      label="Required for completion"
      description="Counts toward progress and unlocking the next module"
      disabled={disabled}
      onChange={event => onLessonChange({ is_required_for_completion: event.target.checked })}
    />
    {lesson.lesson_type === 'video' ? (
      <FormikField
        name={`${namePrefix}.video_watch_threshold_percent`}
        label="Watch % to complete"
        type="number"
        min={0}
        max={100}
        disabled={disabled}
      />
    ) : null}
    {lesson.lesson_type === 'quiz' ? (
      <>
        <FormikField name={`${namePrefix}.quiz_pass_mark_percent`} label="Pass mark (%)" type="number" min={0} max={100} disabled={disabled} />
        <FormikField name={`${namePrefix}.quiz_max_attempts`} label="Max attempts" type="number" min={1} placeholder="Unlimited" disabled={disabled} />
      </>
    ) : null}
    <ImageUploadField
      label="Lesson Image"
      value={lesson.image}
      disabled={disabled}
      getBlockReason={() => null}
      onChange={image => onLessonChange({ image })}
    />
  </div>
);

export default LessonSettingsFields;
