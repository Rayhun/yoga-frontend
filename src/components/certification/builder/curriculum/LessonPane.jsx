'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Formik, Form } from 'formik';
import isEqual from 'lodash/isEqual';
import BuilderTabs from '@/components/certification/builder/BuilderTabs';
import {
  getLessonFieldProblemsByTab,
  getQuizProblems,
  keysOf,
  toLessonFieldsPayload,
  toQuestionsPayload,
  withAdoptedIds,
} from '@/components/certification/builder/sections/curriculumFields';
import LessonContentFields from './LessonContentFields';
import LessonSettingsFields from './LessonSettingsFields';
import QuizEditor from './QuizEditor';
import { LESSON_TAB_IDS } from './lessonTypes';
import { PANE_STATUS, combinePaneStates } from './paneState';
import usePaneAutosave from './usePaneAutosave';

const NAME_PREFIX = 'modules[0].lessons[0]';
const TAB_LIST_CLASS = 'flex gap-1 overflow-x-auto border-b border-stroke dark:border-strokedark';
const tabPanelId = tabId => `lesson-tab-${tabId}`;

// What stops each part of a lesson from saving right now (null / 0 = nothing).
const problemsOf = lesson => {
  const { content, settings } = getLessonFieldProblemsByTab(lesson);
  const quiz = getQuizProblems(lesson);
  return { content, settings, quizMessage: quiz.message, questions: quiz.count };
};

/**
 * Edit pane for ONE lesson in three short tabs — Content (type, title, link or text, duration), Settings
 * (required, watch % / pass mark / attempts, image) and, for a quiz, Questions (one question at a time).
 * Every field of the lesson stays in this pane's ONE form, whichever tab is shown, so switching tabs,
 * questions or lesson type never drops what was typed, and the saves are exactly what the single long
 * form sent: the lesson's fields (PATCH) and, for a quiz, its whole question list (PUT).
 *
 * An edit the API would reject (blank title, an unfinished question) is NOT held back silently — the pane
 * shows "Unsaved changes: <why>", tabs with a problem are marked, and an unfinished question stays in the
 * form and in the navigator. Moving between tabs or questions saves a pending edit first. Seeded once
 * when the pane opens.
 */
const LessonPane = ({ lesson, disabled = false, saveFields, saveQuiz, hasItem, registerPane, onState }) => {
  const formikRef = useRef(null);
  const [initialValues] = useState(() => ({ modules: [{ lessons: [lesson] }] }));
  const [problems, setProblems] = useState(() => problemsOf(lesson));
  const problemsRef = useRef({ fields: null, quiz: null });
  const [tab, setTab] = useState(LESSON_TAB_IDS.content);
  const [nav, setNav] = useState({ qi: 0, oi: 0 });
  // quiz payload → the lesson values it was built from, so the response's ids reach the right questions.
  const sentQuizRef = useRef(new WeakMap());

  const exists = useCallback(() => hasItem('lesson', lesson.id), [hasItem, lesson.id]);

  const fieldsLane = usePaneAutosave({
    save: payload => saveFields(lesson.id, payload),
    baseline: toLessonFieldsPayload(lesson),
    exists,
  });

  const adoptQuizIds = useCallback((sentLesson, savedLesson) => {
    const formik = formikRef.current;
    if (!formik || !sentLesson) return;
    const current = formik.values.modules;
    const adopted = withAdoptedIds(current, keysOf({ modules: [{ lessons: [sentLesson] }] }), [{ lessons: [savedLesson] }]);
    if (!isEqual(adopted, current)) formik.setFieldValue('modules', adopted);
  }, []);

  const quizLane = usePaneAutosave({
    save: async questions => {
      const saved = await saveQuiz(lesson.id, questions);
      adoptQuizIds(sentQuizRef.current.get(questions), saved);
      return saved;
    },
    baseline: toQuestionsPayload(lesson),
    exists,
  });

  const fieldsProblem = problems.content || problems.settings;
  const attention = (problems.content ? 1 : 0) + (problems.settings ? 1 : 0) + problems.questions;
  const state = useMemo(
    () => ({
      ...combinePaneStates([
        fieldsProblem ? { status: PANE_STATUS.pending, message: fieldsProblem } : null,
        problems.quizMessage ? { status: PANE_STATUS.pending, message: `Finish the quiz to save it. ${problems.quizMessage}` } : null,
        { status: fieldsLane.status, message: fieldsLane.errorMessage, canRetry: fieldsLane.canRetry, retry: fieldsLane.retry },
        { status: quizLane.status, message: quizLane.errorMessage, canRetry: quizLane.canRetry, retry: quizLane.retry },
      ]),
      attention,
    }),
    [
      fieldsProblem,
      problems.quizMessage,
      attention,
      fieldsLane.status,
      fieldsLane.errorMessage,
      fieldsLane.canRetry,
      fieldsLane.retry,
      quizLane.status,
      quizLane.errorMessage,
      quizLane.canRetry,
      quizLane.retry,
    ]
  );
  useEffect(() => {
    onState(state);
  }, [onState, state]);

  const { flush: flushFields, discard: discardFields } = fieldsLane;
  const { flush: flushQuiz, discard: discardQuiz } = quizLane;
  const flush = useCallback(async () => {
    const { fields, quiz } = problemsRef.current;
    if (fields || quiz) throw new Error(fields || quiz);
    await flushFields();
    await flushQuiz();
  }, [flushFields, flushQuiz]);
  const discard = useCallback(() => {
    discardFields();
    discardQuiz();
  }, [discardFields, discardQuiz]);
  useEffect(() => {
    registerPane({ flush, discard });
    return () => registerPane(null);
  }, [registerPane, flush, discard]);

  // Moving to another tab / question keeps everything in the form, so a failed or impossible save must not
  // trap the creator here — the pane keeps showing it as unsaved. The pending edit is saved first.
  const saveBeforeMoving = useCallback(async () => {
    try {
      await flush();
    } catch (error) {
      // stays visible as "Unsaved changes" / "Not saved" in the pane
    }
  }, [flush]);
  const selectTab = useCallback(
    async nextTab => {
      await saveBeforeMoving();
      setTab(nextTab);
    },
    [saveBeforeMoving]
  );
  const changeNav = useCallback(
    async next => {
      await saveBeforeMoving();
      setNav(next);
    },
    [saveBeforeMoving]
  );

  const { notifyBlur: notifyFields } = fieldsLane;
  const { notifyBlur: notifyQuiz } = quizLane;
  const handleSave = useCallback(
    next => {
      const nextProblems = problemsOf(next);
      problemsRef.current = { fields: nextProblems.content || nextProblems.settings, quiz: nextProblems.quizMessage };
      setProblems(nextProblems);
      if (!problemsRef.current.fields) notifyFields(toLessonFieldsPayload(next));
      if (next.lesson_type === 'quiz' && !nextProblems.quizMessage) {
        const questions = toQuestionsPayload(next);
        sentQuizRef.current.set(questions, next);
        notifyQuiz(questions);
      }
    },
    [notifyFields, notifyQuiz]
  );

  return (
    <Formik innerRef={formikRef} initialValues={initialValues} onSubmit={() => {}}>
      {({ values, setFieldValue }) => {
        const current = values.modules[0].lessons[0];
        const onLessonChange = patch => {
          const next = { ...current, ...patch };
          setFieldValue(NAME_PREFIX, next);
          handleSave(next);
        };
        const onQuestionsChange = questions => onLessonChange({ questions });

        const tabs = [
          { id: LESSON_TAB_IDS.content, label: 'Content', panelId: tabPanelId(LESSON_TAB_IDS.content), marker: problems.content ? 'warn' : null },
          { id: LESSON_TAB_IDS.settings, label: 'Settings', panelId: tabPanelId(LESSON_TAB_IDS.settings), marker: problems.settings ? 'warn' : null },
          ...(current.lesson_type === 'quiz'
            ? [{ id: LESSON_TAB_IDS.questions, label: 'Questions', panelId: tabPanelId(LESSON_TAB_IDS.questions), marker: problems.questions ? 'warn' : null }]
            : []),
        ];
        // A non-quiz lesson has no Questions tab (its questions stay in the form if the type is switched back).
        const activeTab = tabs.some(item => item.id === tab) ? tab : LESSON_TAB_IDS.content;
        const fieldProps = { namePrefix: NAME_PREFIX, lesson: current, disabled, onLessonChange };

        return (
          <Form className="flex min-w-0 flex-col gap-4" onBlur={() => handleSave(current)} onSubmit={event => event.preventDefault()}>
            <BuilderTabs tabs={tabs} activeTab={activeTab} onSelect={selectTab} ariaLabel="Lesson sections" className={TAB_LIST_CLASS} />
            <div id={tabPanelId(activeTab)} role="tabpanel" aria-labelledby={`${tabPanelId(activeTab)}-tab`}>
              {activeTab === LESSON_TAB_IDS.content ? <LessonContentFields {...fieldProps} /> : null}
              {activeTab === LESSON_TAB_IDS.settings ? <LessonSettingsFields {...fieldProps} /> : null}
              {activeTab === LESSON_TAB_IDS.questions ? (
                <QuizEditor
                  namePrefix={NAME_PREFIX}
                  questions={current.questions}
                  disabled={disabled}
                  nav={nav}
                  onNavChange={changeNav}
                  onQuestionsChange={onQuestionsChange}
                />
              ) : null}
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default LessonPane;
