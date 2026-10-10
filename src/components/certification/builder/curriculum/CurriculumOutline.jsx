'use client';
import React, { useState } from 'react';
import { FiAlertCircle, FiCheck, FiLoader } from 'react-icons/fi';
import { MdAdd, MdDelete, MdKeyboardArrowDown, MdKeyboardArrowUp, MdSwapVert } from 'react-icons/md';
import Button from '@/components/common/Button';
import { getLessonStatus, getModuleStatus } from './itemStatus';
import { LESSON_TYPE_OPTIONS } from './lessonTypes';
import { PANE_STATUS } from './paneState';

const TYPE_ICON = Object.fromEntries(LESSON_TYPE_OPTIONS.map(option => [option.value, option.label.split(' ')[0]]));

const IconButton = ({ label, onClick, disabled, danger = false, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    className={`rounded p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-30 ${
      danger ? 'text-red-500' : 'text-gray-500 hover:text-primary'
    }`}
  >
    {children}
  </button>
);

// Save state of one item, as a small icon + words (never colour alone).
const StateMark = ({ state }) => {
  if (state?.status === PANE_STATUS.saving) return <FiLoader aria-label="Saving" className="animate-spin text-gray-500" size={13} />;
  if (state?.status === PANE_STATUS.error) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-red-600">
        <FiAlertCircle aria-hidden size={13} /> Not saved
      </span>
    );
  }
  if (state?.status === PANE_STATUS.pending) return <span className="text-xs text-gray-500">Unsaved</span>;
  if (state?.status === PANE_STATUS.saved) return <FiCheck aria-label="Saved" className="text-green-600" size={13} />;
  return null;
};

// How many things still need finishing in a lesson: what its tabs/questions report while it is open
// (an unfinished question is never saved, so the saved copy can't show it), else the saved quiz's own.
const attentionOf = (lessonStatus, itemState) => itemState?.attention ?? lessonStatus.quizProblems;

const Badge = ({ tone = 'amber', children }) => (
  <span
    className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
      tone === 'red'
        ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
    }`}
  >
    {children}
  </span>
);

/**
 * The curriculum outline: modules and their lessons as a tree, with the buttons to add, reorder, move
 * and delete them. It holds no inputs — only titles, status marks and buttons. Everything it triggers
 * is one granular request (see useCurriculum); selecting a row opens that item in the edit pane.
 */
const CurriculumOutline = ({
  modules,
  selectedKey,
  itemStates,
  blockedNotices,
  disabled = false,
  onSelect,
  onAddModule,
  onAddLesson,
  onMoveModule,
  onMoveLesson,
  onMoveLessonToModule,
  onRemoveModule,
  onRemoveLesson,
}) => {
  // The lesson whose "Move to…" choices are open (a list of buttons, not an input).
  const [movingLessonId, setMovingLessonId] = useState(null);
  const lessonCount = modules.reduce((total, module) => total + module.lessons.length, 0);

  const rowClass = key =>
    `flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary ${
      key === selectedKey ? 'bg-primary/10 font-semibold text-primary' : 'text-black hover:bg-gray-50 dark:text-white dark:hover:bg-meta-4'
    }`;

  return (
    <nav aria-label="Curriculum outline" className="rounded-lg border border-gray-200 p-3 dark:border-strokedark">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold text-black dark:text-white">Outline</h3>
        <span className="text-xs text-body dark:text-gray-400">
          {modules.length} module{modules.length === 1 ? '' : 's'} · {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
        </span>
      </div>

      {modules.length === 0 ? <p className="mb-2 text-sm text-body dark:text-gray-400">No modules yet.</p> : null}

      <ul className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1 lg:max-h-[70vh]">
        {modules.map((module, mi) => {
          const moduleStatus = getModuleStatus(module, blockedNotices);
          return (
            <li key={module._key} data-outline-key={module._key}>
              <div className="flex items-center gap-1">
                <button type="button" aria-current={module._key === selectedKey ? 'true' : undefined} onClick={() => onSelect(module._key)} className={rowClass(module._key)}>
                  <span className="shrink-0 text-xs text-body">{mi + 1}.</span>
                  <span className="truncate">{module.title}</span>
                </button>
                <StateMark state={itemStates.get(module._key)} />
                {moduleStatus.blocked ? <Badge tone="red">In use</Badge> : null}
                <IconButton label={`Move module ${module.title} up`} disabled={disabled || mi === 0} onClick={() => onMoveModule(module.id, -1)}>
                  <MdKeyboardArrowUp size={16} />
                </IconButton>
                <IconButton label={`Move module ${module.title} down`} disabled={disabled || mi === modules.length - 1} onClick={() => onMoveModule(module.id, 1)}>
                  <MdKeyboardArrowDown size={16} />
                </IconButton>
                <IconButton label={`Delete module ${module.title}`} danger disabled={disabled} onClick={() => onRemoveModule(module.id)}>
                  <MdDelete size={16} />
                </IconButton>
              </div>

              <ul className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-gray-100 pl-2 dark:border-strokedark">
                {module.lessons.map((lesson, li) => {
                  const lessonStatus = getLessonStatus(lesson, blockedNotices);
                  return (
                    <li key={lesson._key} data-outline-key={lesson._key}>
                      <div className="flex items-center gap-1">
                        <button type="button" aria-current={lesson._key === selectedKey ? 'true' : undefined} onClick={() => onSelect(lesson._key)} className={rowClass(lesson._key)}>
                          <span aria-hidden className="shrink-0">{TYPE_ICON[lesson.lesson_type]}</span>
                          <span className="truncate">{lesson.title}</span>
                        </button>
                        <StateMark state={itemStates.get(lesson._key)} />
                        {attentionOf(lessonStatus, itemStates.get(lesson._key)) ? (
                          <Badge>{attentionOf(lessonStatus, itemStates.get(lesson._key))} to finish</Badge>
                        ) : null}
                        {lessonStatus.blocked ? <Badge tone="red">In use</Badge> : null}
                        <IconButton label={`Move lesson ${lesson.title} up`} disabled={disabled || li === 0} onClick={() => onMoveLesson(module.id, lesson.id, -1)}>
                          <MdKeyboardArrowUp size={15} />
                        </IconButton>
                        <IconButton label={`Move lesson ${lesson.title} down`} disabled={disabled || li === module.lessons.length - 1} onClick={() => onMoveLesson(module.id, lesson.id, 1)}>
                          <MdKeyboardArrowDown size={15} />
                        </IconButton>
                        <IconButton
                          label={`Move lesson ${lesson.title} to another module`}
                          disabled={disabled || modules.length < 2}
                          onClick={() => setMovingLessonId(movingLessonId === lesson.id ? null : lesson.id)}
                        >
                          <MdSwapVert size={15} />
                        </IconButton>
                        <IconButton label={`Delete lesson ${lesson.title}`} danger disabled={disabled} onClick={() => onRemoveLesson(lesson.id)}>
                          <MdDelete size={15} />
                        </IconButton>
                      </div>
                      {movingLessonId === lesson.id ? (
                        <div role="group" aria-label={`Move ${lesson.title} to`} className="ml-6 mt-1 flex flex-wrap gap-1">
                          {modules
                            .filter(target => target.id !== module.id)
                            .map(target => (
                              <button
                                key={target.id}
                                type="button"
                                disabled={disabled}
                                onClick={() => {
                                  setMovingLessonId(null);
                                  onMoveLessonToModule(lesson.id, target.id);
                                }}
                                className="rounded-md border border-gray-300 px-2 py-0.5 text-xs hover:border-primary dark:border-strokedark"
                              >
                                {target.title}
                              </button>
                            ))}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
                <li>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onAddLesson(module.id)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40"
                  >
                    <MdAdd aria-hidden /> Add lesson
                  </button>
                </li>
              </ul>
            </li>
          );
        })}
      </ul>

      <Button type="button" size="sm" variant="secondary" className="mt-3" disabled={disabled} onClick={onAddModule}>
        <MdAdd className="mr-1" /> Add Module
      </Button>
    </nav>
  );
};

export default CurriculumOutline;
