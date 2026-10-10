'use client';
import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import Button from '@/components/common/Button';
import { LESSON_TYPE_OPTIONS } from './lessonTypes';

const DEFAULT_LESSON_TYPE = 'video';

const schema = Yup.object({
  title: Yup.string().trim().required('Give it a title to create it.'),
  lesson_type: Yup.string().required('Pick a lesson type.'),
});

/**
 * "Add module" / "Add lesson": the item is created on the server only once it has a title, so an
 * untitled item never exists. One input for a module, two (title + type) for a lesson.
 */
const NewItemForm = ({ kind, parentTitle, disabled = false, onCreate, onCancel }) => {
  const isLesson = kind === 'lesson';
  return (
    <Formik
      initialValues={{ title: '', lesson_type: DEFAULT_LESSON_TYPE }}
      validationSchema={schema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await onCreate({ title: values.title.trim(), lesson_type: values.lesson_type });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-3">
          <div>
            <h3 className="text-base font-bold text-black dark:text-white">{isLesson ? 'New lesson' : 'New module'}</h3>
            {isLesson && parentTitle ? <p className="text-sm text-body dark:text-gray-400">In “{parentTitle}”</p> : null}
          </div>
          <FormikField
            name="title"
            label={isLesson ? 'Lesson title' : 'Module title'}
            placeholder={isLesson ? 'e.g. Understanding the menopause transition' : 'e.g. Module 1 — Foundations'}
            required
            disabled={disabled || isSubmitting}
          />
          {isLesson ? (
            <FormikSelect name="lesson_type" label="Lesson type" options={LESSON_TYPE_OPTIONS} disabled={disabled || isSubmitting} />
          ) : null}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={disabled || isSubmitting} isLoading={isSubmitting}>
              {isLesson ? 'Create lesson' : 'Create module'}
            </Button>
            <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default NewItemForm;
