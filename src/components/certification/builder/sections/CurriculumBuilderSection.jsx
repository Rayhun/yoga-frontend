'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Formik, Form } from 'formik';
import isEqual from 'lodash/isEqual';
import * as Yup from 'yup';
import { MdAdd, MdDelete, MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import FormikField from '@/components/common/form/formik/FormikField';
import Button from '@/components/common/Button';
import useSectionAutosave from '@/hooks/useSectionAutosave';
import SectionCard from '@/components/certification/builder/SectionCard';
import { toastApiError } from '@/utils/helpers';
import { blankLesson, blankModule, getUnsavableReason, keysOf, toPayload, withAdoptedIds } from './curriculumFields';
import CurriculumLessonFields from './CurriculumLessonFields';
import CurriculumModuleFields from './CurriculumModuleFields';

const CONFLICT_STATUS = 409;
// A 409 ("lesson has learner progress") fails the same way on every retry — only fixable by
// keeping the item, so no Retry button for it.
const isRetryable = error => error?.response?.status !== CONFLICT_STATUS;

const validationSchema = Yup.object({
  modules: Yup.array().of(
    Yup.object({
      title: Yup.string().required('Module title is required'),
      lessons: Yup.array().of(
        Yup.object({
          title: Yup.string().required('Lesson title is required'),
          lesson_type: Yup.string().required('Required'),
          duration_minutes: Yup.number().typeError('Enter minutes as a number').min(0, 'Must be 0 or more'),
          video_watch_threshold_percent: Yup.number().typeError('Enter a percentage').min(0, '0–100').max(100, '0–100'),
        })
      ),
    })
  ),
});

const moveItem = (array, index, direction) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= array.length) return array;
  const next = [...array];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
};

// 409 body `data.blocked` → notices keyed by the lesson/module that couldn't be removed.
const toBlockedNotices = (blocked = []) => {
  const learners = count => `${count} learner${count === 1 ? ' has' : 's have'}`;
  const byLesson = new Map();
  const byModule = new Map();
  blocked.forEach(item => {
    if (item.kind === 'question') {
      // Attempted quiz: the question comes back; say so under its quiz lesson.
      const existing = byLesson.get(item.lesson_id);
      const message = `Can't remove the question "${item.question_prompt}" — ${learners(item.learner_count)} already attempted this quiz. It has been restored.`;
      byLesson.set(item.lesson_id, existing ? `${existing} ${message}` : message);
    } else if (item.module_removed) {
      const existing = byModule.get(item.module_id) || [];
      byModule.set(item.module_id, [...existing, `"${item.lesson_title}" (${learners(item.learner_count)} started it)`]);
    } else {
      byLesson.set(item.lesson_id, `Can't remove this lesson — ${learners(item.learner_count)} already started it. It has been restored.`);
    }
  });
  const moduleNotices = new Map(
    [...byModule].map(([moduleId, lessons]) => [
      moduleId,
      `Can't remove this module — learners have progress on ${lessons.join(', ')}. It has been restored.`,
    ])
  );
  return { byLesson, byModule: moduleNotices };
};

const BlockedNotice = ({ message }) =>
  message ? (
    <p role="alert" className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
      {message}
    </p>
  ) : null;

/**
 * Module/lesson list editor — add/remove per item, up/down reorder (no drag-and-drop dependency,
 * per the backend plan's MVP substitute note). Every structural change (add/remove/reorder) and
 * every discrete control (type select, required switch, image, unlock rule) saves immediately via
 * the same debounced useSectionAutosave text fields use on blur. Formik's FieldArray isn't used
 * here: its push/remove helpers mutate state asynchronously, which would make "read values, save
 * immediately" read stale data — plain array functions computed at click-time and pushed through
 * setFieldValue + the save call together sidestep that entirely.
 *
 * Saving waits until every module/lesson has a title (the API rejects blank titles), and a 409
 * (the save would delete a lesson learners have started) restores the curriculum and shows the
 * reason next to the item that couldn't be removed.
 */
const CurriculumBuilderSection = ({ initialValues, onSave, disabled = false }) => {
  const formikRef = useRef(null);
  // payload object → keysOf(values) it was built from; the autosave hook hands the very same
  // payload object back to saveCurriculum, so the response can be matched to the right items.
  const sentKeysRef = useRef(new WeakMap());
  const [blockedNotices, setBlockedNotices] = useState(null);
  const [unsavableReason, setUnsavableReason] = useState(null);

  const saveCurriculum = useCallback(
    async payload => {
      try {
        const savedModules = await onSave(payload);
        setBlockedNotices(null);
        const sentKeys = sentKeysRef.current.get(payload);
        const formik = formikRef.current;
        if (sentKeys && formik && Array.isArray(savedModules)) {
          const currentModules = formik.values.modules || [];
          const adoptedModules = withAdoptedIds(currentModules, sentKeys, savedModules);
          if (!isEqual(adoptedModules, currentModules)) formik.setFieldValue('modules', adoptedModules);
        }
        return savedModules;
      } catch (error) {
        if (error?.response?.status === CONFLICT_STATUS) {
          // Nothing was written server-side — put the removed items back and say why, inline.
          setBlockedNotices(toBlockedNotices(error.response.data?.data?.blocked));
          toastApiError(error);
          formikRef.current?.resetForm({ values: initialValues });
        }
        throw error;
      }
    },
    [onSave, initialValues]
  );

  const { notifyBlur, markSaved, retry, status, errorMessage, canRetry } = useSectionAutosave(saveCurriculum, {
    isRetryable,
  });

  useEffect(() => {
    markSaved(toPayload(initialValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleSave = useCallback(
    values => {
      const reason = getUnsavableReason(values);
      setUnsavableReason(reason);
      if (reason) return;
      const payload = toPayload(values);
      sentKeysRef.current.set(payload, keysOf(values));
      notifyBlur(payload);
    },
    [notifyBlur]
  );

  return (
    <SectionCard
      title="Curriculum Builder"
      subtitle="Add modules and lessons — link to any video, PDF, or page you host elsewhere."
      status={status}
      errorMessage={errorMessage}
      canRetry={canRetry}
      onRetry={retry}
    >
      <Formik innerRef={formikRef} initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={() => {}}>
        {({ values, setFieldValue }) => {
          const modules = values.modules || [];

          const commitModules = nextModules => {
            setFieldValue('modules', nextModules);
            handleSave({ modules: nextModules });
          };

          const addModule = () => commitModules([...modules, blankModule()]);
          const removeModule = mi => commitModules(modules.filter((_, i) => i !== mi));
          const moveModule = (mi, dir) => commitModules(moveItem(modules, mi, dir));
          const updateModule = (mi, patch) => commitModules(modules.map((m, i) => (i === mi ? { ...m, ...patch } : m)));

          const updateLessons = (mi, updater) =>
            commitModules(modules.map((m, i) => (i === mi ? { ...m, lessons: updater(m.lessons) } : m)));
          const addLesson = mi => updateLessons(mi, lessons => [...lessons, blankLesson()]);
          const removeLesson = (mi, li) => updateLessons(mi, lessons => lessons.filter((_, j) => j !== li));
          const moveLesson = (mi, li, dir) => updateLessons(mi, lessons => moveItem(lessons, li, dir));
          const updateLesson = (mi, li, patch) =>
            updateLessons(mi, lessons => lessons.map((l, j) => (j === li ? { ...l, ...patch } : l)));

          // Same rule as saving: an image uploaded now would only be saved once the curriculum can be.
          const getUploadBlockReason = () => {
            const reason = getUnsavableReason(values);
            return reason ? `${reason.split(' — ')[0]} first, then upload an image.` : null;
          };

          return (
            <Form className="flex flex-col gap-4" onBlur={() => handleSave(values)}>
              {unsavableReason ? (
                <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {unsavableReason}
                </p>
              ) : null}

              {modules.map((module, mi) => (
                <div key={module._key || mi} className="rounded-lg border border-gray-200 p-4 dark:border-strokedark">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <FormikField name={`modules[${mi}].title`} label={`Module ${mi + 1}`} placeholder="e.g. Module 1 — Foundations" disabled={disabled} />
                    </div>
                    <div className="flex items-center gap-1 mt-6">
                      <button type="button" disabled={disabled || mi === 0} onClick={() => moveModule(mi, -1)} className="p-1.5 text-gray-500 disabled:opacity-30" aria-label="Move module up">
                        <MdKeyboardArrowUp size={18} />
                      </button>
                      <button type="button" disabled={disabled || mi === modules.length - 1} onClick={() => moveModule(mi, 1)} className="p-1.5 text-gray-500 disabled:opacity-30" aria-label="Move module down">
                        <MdKeyboardArrowDown size={18} />
                      </button>
                      <button type="button" disabled={disabled} onClick={() => removeModule(mi)} className="p-1.5 text-red-500" aria-label="Remove module">
                        <MdDelete size={18} />
                      </button>
                    </div>
                  </div>
                  <BlockedNotice message={module.id ? blockedNotices?.byModule.get(module.id) : null} />

                  <CurriculumModuleFields
                    mi={mi}
                    module={module}
                    disabled={disabled}
                    onModuleChange={patch => updateModule(mi, patch)}
                    getBlockReason={getUploadBlockReason}
                  />

                  <div className="mt-4 flex flex-col gap-4 pl-4 border-l-2 border-gray-100 dark:border-strokedark">
                    {module.lessons.map((lesson, li) => (
                      <div key={lesson._key || li}>
                        <div className="flex items-start gap-2">
                          <CurriculumLessonFields
                            mi={mi}
                            li={li}
                            lesson={lesson}
                            disabled={disabled}
                            onLessonChange={patch => updateLesson(mi, li, patch)}
                            getBlockReason={getUploadBlockReason}
                          />
                          <div className="flex items-center gap-1 mt-6">
                            <button type="button" disabled={disabled || li === 0} onClick={() => moveLesson(mi, li, -1)} className="p-1.5 text-gray-500 disabled:opacity-30" aria-label="Move lesson up">
                              <MdKeyboardArrowUp size={16} />
                            </button>
                            <button type="button" disabled={disabled || li === module.lessons.length - 1} onClick={() => moveLesson(mi, li, 1)} className="p-1.5 text-gray-500 disabled:opacity-30" aria-label="Move lesson down">
                              <MdKeyboardArrowDown size={16} />
                            </button>
                            <button type="button" disabled={disabled} onClick={() => removeLesson(mi, li)} className="p-1.5 text-red-500" aria-label="Remove lesson">
                              <MdDelete size={16} />
                            </button>
                          </div>
                        </div>
                        <BlockedNotice message={lesson.id ? blockedNotices?.byLesson.get(lesson.id) : null} />
                      </div>
                    ))}
                    <Button type="button" size="sm" variant="secondary" className="self-start" disabled={disabled} onClick={() => addLesson(mi)}>
                      <MdAdd className="mr-1" /> Add Lesson
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="button" variant="secondary" className="self-start" disabled={disabled} onClick={addModule}>
                <MdAdd className="mr-1" /> Add Module
              </Button>
            </Form>
          );
        }}
      </Formik>
    </SectionCard>
  );
};

export default CurriculumBuilderSection;
