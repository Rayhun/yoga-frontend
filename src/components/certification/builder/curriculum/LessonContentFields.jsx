'use client';
import React from 'react';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { TEXT_LESSON_TYPES, URL_LESSON_TYPES } from '@/components/certification/builder/sections/curriculumFields';
import { LESSON_TYPE_OPTIONS, TEXT_LABELS, URL_LABELS } from './lessonTypes';

// What the creator typed into a field the new type doesn't use. It stays in the form (switching back
// restores it) but the lesson no longer saves it.
const getUnusedNotice = lesson => {
  if (lesson.content_url?.trim() && !URL_LESSON_TYPES.includes(lesson.lesson_type)) {
    return 'The link you entered isn’t used by this lesson type. It is kept here if you switch back, but it is not saved with the lesson.';
  }
  if (lesson.text_content?.trim() && !TEXT_LESSON_TYPES.includes(lesson.lesson_type)) {
    return 'The text you entered isn’t used by this lesson type. It is kept here if you switch back, but it is not saved with the lesson.';
  }
  return null;
};

/**
 * "Content" tab: the lesson's type and title, what it points at (link or text) and its duration.
 * Four inputs for every type (three for a quiz, whose questions have their own tab). The field names
 * are the lesson's own (`namePrefix.field`) in the pane's single form, so nothing here owns any state:
 * values entered on another tab are untouched while this one is shown.
 */
const LessonContentFields = ({ namePrefix, lesson, disabled, onLessonChange }) => {
  const notice = getUnusedNotice(lesson);
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <FormikSelect
        name={`${namePrefix}.lesson_type`}
        label="Lesson Type"
        options={LESSON_TYPE_OPTIONS}
        disabled={disabled}
        // FormikSelect passes the value; picking the selected option again clears it, which a lesson
        // type can't be — keep the current type then.
        onChange={value => onLessonChange({ lesson_type: value || lesson.lesson_type })}
      />
      <FormikField name={`${namePrefix}.title`} label="Lesson Title" placeholder="e.g. Understanding the menopause transition" required disabled={disabled} />

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

      <FormikField name={`${namePrefix}.duration_minutes`} label="Duration (minutes)" type="number" min={0} placeholder="e.g. 12" disabled={disabled} />

      {notice ? (
        <p role="note" className="md:col-span-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {notice}
        </p>
      ) : null}
    </div>
  );
};

export default LessonContentFields;
