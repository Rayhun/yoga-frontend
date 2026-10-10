'use client';
import React from 'react';
import { MdAdd, MdDelete, MdKeyboardArrowDown, MdKeyboardArrowLeft, MdKeyboardArrowRight, MdKeyboardArrowUp } from 'react-icons/md';
import FormikField from '@/components/common/form/formik/FormikField';
import Button from '@/components/common/Button';
import useConfirm from '@/hooks/useConfirm';
import {
  MIN_QUIZ_OPTIONS,
  MULTIPLE_CHOICE,
  SINGLE_CHOICE,
  blankOption,
  blankQuestion,
  getQuestionProblem,
  trueFalseQuestion,
} from '@/components/certification/builder/sections/curriculumFields';

const USER_CANCELLED = 'User cancelled';
const PREVIEW_LENGTH = 40;
const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const QUESTION_TYPE_OPTIONS = [
  { value: SINGLE_CHOICE, label: 'Single choice (one correct answer)' },
  { value: MULTIPLE_CHOICE, label: 'Multiple choice (one or more correct)' },
];

const moveItem = (array, index, direction) => {
  const target = index + direction;
  if (target < 0 || target >= array.length) return array;
  const next = [...array];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

const clamp = (value, length) => Math.max(0, Math.min(value, length - 1));
const optionLetter = index => OPTION_LETTERS[index] || String(index + 1);
const questionHasContent = question =>
  Boolean(question.prompt?.trim() || question.explanation?.trim() || (question.options || []).some(option => option.text?.trim()));
const questionPreview = question =>
  question.prompt?.trim() ? `${question.prompt.trim().slice(0, PREVIEW_LENGTH)}${question.prompt.trim().length > PREVIEW_LENGTH ? '…' : ''}` : 'New question';

const IconAction = ({ label, onClick, disabled, danger = false, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    className={`rounded p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-30 ${danger ? 'text-red-500' : 'text-gray-500 hover:text-primary'}`}
  >
    {children}
  </button>
);

/**
 * Quiz authoring for one quiz lesson, one question at a time. A navigator lists the questions (an
 * incomplete one is marked and never dropped); the open question shows its type, text and explanation
 * (3 inputs) and its options as a row of lettered chips with ONE option's form open (text + correct
 * answer, 2 inputs) — 5 inputs in total however many questions or options there are.
 *
 * Everything lives in the lesson's single form (`namePrefix.questions[...]`); this component only chooses
 * what to show. Structural edits and the correct-answer control call `onQuestionsChange(nextQuestions)`
 * (saved at once, like every discrete control); text inputs save on blur through the pane's form.
 * `nav` = { qi, oi } is the open question/option; `onNavChange` is asynchronous because the pane saves
 * a pending edit before moving.
 */
const QuizEditor = ({ namePrefix, questions = [], disabled = false, nav, onNavChange, onQuestionsChange }) => {
  const confirm = useConfirm();
  const qi = clamp(nav.qi, questions.length);
  const question = questions[qi];
  const oi = question ? clamp(nav.oi, question.options.length) : 0;

  const askToDelete = async (message, heading) => {
    try {
      await confirm({ heading, message });
      return true;
    } catch (error) {
      if (error?.message === USER_CANCELLED) return false;
      throw error;
    }
  };

  const updateQuestion = (index, updater) =>
    onQuestionsChange(questions.map((item, i) => (i === index ? updater(item) : item)));
  const updateOptions = updater => updateQuestion(qi, item => ({ ...item, options: updater(item.options) }));

  const addQuestion = factory => {
    onQuestionsChange([...questions, factory()]);
    onNavChange({ qi: questions.length, oi: 0 });
  };

  const removeQuestion = async () => {
    const label = `Delete question ${qi + 1}${question.prompt?.trim() ? ` “${questionPreview(question)}”` : ''}? This can’t be undone.`;
    if (questionHasContent(question) && !(await askToDelete(label, 'Delete question'))) return;
    onQuestionsChange(questions.filter((_, index) => index !== qi));
    onNavChange({ qi: clamp(qi, questions.length - 1), oi: 0 });
  };

  const moveQuestion = direction => {
    const next = moveItem(questions, qi, direction);
    if (next === questions) return;
    onQuestionsChange(next);
    onNavChange({ qi: qi + direction, oi });
  };

  const setQuestionType = questionType =>
    updateQuestion(qi, item => {
      // Switching to single choice keeps only the first correct answer.
      let keptCorrect = false;
      const options =
        questionType === SINGLE_CHOICE
          ? item.options.map(option => {
              const isCorrect = option.is_correct && !keptCorrect;
              keptCorrect = keptCorrect || isCorrect;
              return { ...option, is_correct: isCorrect };
            })
          : item.options;
      return { ...item, question_type: questionType, options };
    });

  const toggleCorrect = () =>
    updateQuestion(qi, item => ({
      ...item,
      options: item.options.map((option, index) => {
        if (item.question_type === SINGLE_CHOICE) return { ...option, is_correct: index === oi };
        return index === oi ? { ...option, is_correct: !option.is_correct } : option;
      }),
    }));

  const addOption = () => {
    updateOptions(options => [...options, blankOption()]);
    onNavChange({ qi, oi: question.options.length });
  };

  const removeOption = async () => {
    const option = question.options[oi];
    if (option.text?.trim() && !(await askToDelete(`Delete option ${optionLetter(oi)} “${option.text.trim()}”?`, 'Delete option'))) return;
    updateOptions(options => options.filter((_, index) => index !== oi));
    onNavChange({ qi, oi: clamp(oi, question.options.length - 1) });
  };

  const moveOption = direction => {
    updateOptions(options => moveItem(options, oi, direction));
    onNavChange({ qi, oi: clamp(oi + direction, question.options.length) });
  };

  const problem = question ? getQuestionProblem(question) : null;
  const isSingle = question?.question_type === SINGLE_CHOICE;
  const questionPrefix = `${namePrefix}.questions[${qi}]`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-semibold text-gray-800 dark:text-white">Questions ({questions.length})</h4>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" disabled={disabled} onClick={() => addQuestion(blankQuestion)}>
              <MdAdd className="mr-1" /> Add Question
            </Button>
            <Button type="button" size="sm" variant="secondary" disabled={disabled} onClick={() => addQuestion(trueFalseQuestion)}>
              <MdAdd className="mr-1" /> Add True/False
            </Button>
          </div>
        </div>
        {questions.length === 0 ? <p className="text-sm text-gray-500">No questions yet — add the first one.</p> : null}
        <ol aria-label="Questions" className="flex flex-col gap-1">
          {questions.map((item, index) => {
            const itemProblem = getQuestionProblem(item);
            return (
              <li key={item._key || index}>
                <button
                  type="button"
                  aria-current={index === qi ? 'true' : undefined}
                  onClick={() => onNavChange({ qi: index, oi: 0 })}
                  className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    index === qi ? 'border-primary bg-primary/10 font-semibold text-primary' : 'border-gray-200 text-black hover:border-primary dark:border-strokedark dark:text-white'
                  }`}
                >
                  <span className="truncate">
                    {index + 1}. {questionPreview(item)}
                  </span>
                  {itemProblem ? (
                    <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">Incomplete</span>
                  ) : (
                    <span className="shrink-0 text-xs text-green-600">Complete</span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {question ? (
        <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-gray-800 dark:text-white">
              Question {qi + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-1">
              <IconAction label="Move question up" disabled={disabled || qi === 0} onClick={() => moveQuestion(-1)}>
                <MdKeyboardArrowUp size={18} />
              </IconAction>
              <IconAction label="Move question down" disabled={disabled || qi === questions.length - 1} onClick={() => moveQuestion(1)}>
                <MdKeyboardArrowDown size={18} />
              </IconAction>
              <IconAction label="Delete question" danger disabled={disabled} onClick={removeQuestion}>
                <MdDelete size={18} />
              </IconAction>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            <select
              aria-label="Question type"
              value={question.question_type}
              disabled={disabled}
              onChange={event => setQuestionType(event.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2 py-2 text-sm dark:border-strokedark dark:bg-boxdark"
            >
              {QUESTION_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FormikField name={`${questionPrefix}.prompt`} label="Question" placeholder="e.g. Which hormone declines during menopause?" rows={2} required disabled={disabled} />
            <FormikField name={`${questionPrefix}.explanation`} label="Explanation (shown with the result)" rows={2} disabled={disabled} />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Options — mark {isSingle ? 'the correct answer' : 'every correct answer'}
              </span>
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Options">
                {question.options.map((option, index) => (
                  <button
                    key={option._key || index}
                    type="button"
                    aria-current={index === oi ? 'true' : undefined}
                    aria-label={`Option ${optionLetter(index)}${option.is_correct ? ' (correct)' : ''}${option.text?.trim() ? '' : ' (empty)'}`}
                    onClick={() => onNavChange({ qi, oi: index })}
                    className={`min-w-[2.5rem] rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      index === oi ? 'border-primary bg-primary/10 font-semibold text-primary' : 'border-gray-300 dark:border-strokedark'
                    }`}
                  >
                    {optionLetter(index)}
                    {option.is_correct ? ' ✓' : ''}
                    {option.text?.trim() ? '' : ' !'}
                  </button>
                ))}
                <Button type="button" size="sm" variant="secondary" disabled={disabled} onClick={addOption}>
                  <MdAdd className="mr-1" /> Add Option
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex shrink-0 items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <input
                    type={isSingle ? 'radio' : 'checkbox'}
                    name={`${questionPrefix}-correct`}
                    checked={Boolean(question.options[oi].is_correct)}
                    disabled={disabled}
                    onChange={toggleCorrect}
                    className="h-4 w-4 accent-primary"
                  />
                  Correct
                </label>
                <div className="flex-1">
                  <FormikField name={`${questionPrefix}.options[${oi}].text`} placeholder={`Option ${optionLetter(oi)}`} disabled={disabled} />
                </div>
                <IconAction label="Move option left" disabled={disabled || oi === 0} onClick={() => moveOption(-1)}>
                  <MdKeyboardArrowLeft size={18} />
                </IconAction>
                <IconAction label="Move option right" disabled={disabled || oi === question.options.length - 1} onClick={() => moveOption(1)}>
                  <MdKeyboardArrowRight size={18} />
                </IconAction>
                <IconAction label="Delete option" danger disabled={disabled || question.options.length <= MIN_QUIZ_OPTIONS} onClick={removeOption}>
                  <MdDelete size={18} />
                </IconAction>
              </div>
            </div>
            {problem ? <p className="text-sm text-amber-700 dark:text-amber-300">{problem}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default QuizEditor;
