'use client';
import React, { useCallback, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { MdAdd, MdDelete, MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import Button from '@/components/common/Button';
import useSectionAutosave from '@/hooks/useSectionAutosave';
import SectionCard from '@/components/certification/builder/SectionCard';

const LESSON_TYPE_OPTIONS = [
  { value: 'video', label: '🎥 Video' },
  { value: 'pdf', label: '📄 PDF' },
  { value: 'text', label: '📝 Text' },
  { value: 'quiz', label: '🧩 Quiz' },
  { value: 'assignment', label: '📤 Assignment' },
  { value: 'link', label: '🔗 Link' },
];

// Per-type field mapping — backend model only has content_url (video/pdf/link) and text_content
// (everything else with a body). There's no dedicated "assignment instructions" field on
// CertLesson, so assignment reuses text_content, same as the original (pre-mockup) frontend
// plan draft described. Quiz gets no additional field this pass — the plan doc itself flags
// quiz-authoring ("reusing components/lms/quiz if its shape fits") as still an open question,
// not something to fake a picker for here.
const URL_LESSON_TYPES = ['video', 'pdf', 'link'];
const URL_LABELS = { video: 'Video URL', pdf: 'PDF URL', link: 'Link URL' };
const TEXT_LESSON_TYPES = ['text', 'assignment'];
const TEXT_LABELS = { text: 'Text Content', assignment: 'Assignment Instructions' };

const blankLesson = () => ({ title: '', lesson_type: 'video', content_url: '', text_content: '' });
const blankModule = () => ({ title: '', lessons: [] });

const validationSchema = Yup.object({
  modules: Yup.array().of(
    Yup.object({
      title: Yup.string().required('Module title is required'),
      lessons: Yup.array().of(
        Yup.object({
          title: Yup.string().required('Lesson title is required'),
          lesson_type: Yup.string().required('Required'),
        })
      ),
    })
  ),
});

// Strips UI-only fields the backend doesn't expect and drops whichever of content_url/
// text_content doesn't apply to that lesson's type — the modules PUT is delete-then-recreate,
// so this payload IS the entire curriculum on every save, order taken from array position.
const toPayload = values => ({
  modules: (values.modules || []).map(module => ({
    title: module.title,
    lessons: (module.lessons || []).map(lesson => ({
      title: lesson.title,
      lesson_type: lesson.lesson_type,
      content_url: URL_LESSON_TYPES.includes(lesson.lesson_type) ? lesson.content_url || null : null,
      text_content: TEXT_LESSON_TYPES.includes(lesson.lesson_type) ? lesson.text_content || null : null,
    })),
  })),
});

const moveItem = (array, index, direction) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= array.length) return array;
  const next = [...array];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
};

/**
 * Module/lesson list editor — add/remove per item, up/down reorder (no drag-and-drop dependency,
 * per the backend plan's MVP substitute note). Every structural change (add/remove/reorder)
 * saves immediately via the same debounced useSectionAutosave text fields use on blur — a click
 * is already a discrete, deliberate action, same treatment as the Target Learner Type buttons in
 * ProgramBasicsSection. Formik's FieldArray isn't used here: its push/remove helpers mutate state
 * asynchronously, which would make "read values, save immediately" read stale data — plain array
 * functions computed at click-time and pushed through setFieldValue + the save call together sidestep
 * that entirely.
 */
const CurriculumBuilderSection = ({ initialValues, onSave, disabled = false }) => {
  const { notifyBlur, markSaved, status } = useSectionAutosave(onSave);

  useEffect(() => {
    markSaved(toPayload(initialValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleSave = useCallback(values => notifyBlur(toPayload(values)), [notifyBlur]);

  return (
    <SectionCard title="Curriculum Builder" subtitle="Add modules and lessons — link to any video, PDF, or page you host elsewhere." status={status}>
      <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={() => {}}>
        {({ values, setFieldValue }) => {
          const modules = values.modules || [];

          const commitModules = nextModules => {
            setFieldValue('modules', nextModules);
            handleSave({ modules: nextModules });
          };

          const addModule = () => commitModules([...modules, blankModule()]);
          const removeModule = mi => commitModules(modules.filter((_, i) => i !== mi));
          const moveModule = (mi, dir) => commitModules(moveItem(modules, mi, dir));

          const addLesson = mi => {
            const next = modules.map((m, i) => (i === mi ? { ...m, lessons: [...m.lessons, blankLesson()] } : m));
            commitModules(next);
          };
          const removeLesson = (mi, li) => {
            const next = modules.map((m, i) => (i === mi ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) } : m));
            commitModules(next);
          };
          const moveLesson = (mi, li, dir) => {
            const next = modules.map((m, i) => (i === mi ? { ...m, lessons: moveItem(m.lessons, li, dir) } : m));
            commitModules(next);
          };

          return (
            <Form className="flex flex-col gap-4" onBlur={() => handleSave(values)}>
              {modules.map((module, mi) => (
                <div key={mi} className="rounded-lg border border-gray-200 p-4 dark:border-strokedark">
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

                  <div className="mt-3 flex flex-col gap-3 pl-4 border-l-2 border-gray-100 dark:border-strokedark">
                    {module.lessons.map((lesson, li) => (
                      <div key={li} className="flex items-start gap-2">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <FormikSelect
                            name={`modules[${mi}].lessons[${li}].lesson_type`}
                            label="Lesson Type"
                            options={LESSON_TYPE_OPTIONS}
                            disabled={disabled}
                          />
                          <FormikField name={`modules[${mi}].lessons[${li}].title`} label="Lesson Title" placeholder="e.g. Understanding the menopause transition" disabled={disabled} />
                          {URL_LESSON_TYPES.includes(lesson.lesson_type) ? (
                            <div className="md:col-span-2">
                              <FormikField
                                name={`modules[${mi}].lessons[${li}].content_url`}
                                label={URL_LABELS[lesson.lesson_type]}
                                placeholder="https://youtube.com/... or https://vimeo.com/..."
                                disabled={disabled}
                              />
                            </div>
                          ) : null}
                          {TEXT_LESSON_TYPES.includes(lesson.lesson_type) ? (
                            <div className="md:col-span-2">
                              <FormikField
                                name={`modules[${mi}].lessons[${li}].text_content`}
                                label={TEXT_LABELS[lesson.lesson_type]}
                                rows={3}
                                disabled={disabled}
                              />
                            </div>
                          ) : null}
                          {lesson.lesson_type === 'quiz' ? (
                            <p className="md:col-span-2 text-xs text-gray-400">Quiz content is configured separately — coming in a later pass.</p>
                          ) : null}
                        </div>
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
