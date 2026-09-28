import { MdAdd, MdDelete, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { RiCloseCircleLine } from 'react-icons/ri';
import FormikField from '@/components/common/form/formik/FormikField';
import Button from '@/components/common/Button';
import {
  MIN_QUIZ_OPTIONS,
  MULTIPLE_CHOICE,
  SINGLE_CHOICE,
  blankOption,
  blankQuestion,
  getQuestionProblem,
  trueFalseQuestion,
} from './curriculumFields';

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

const IconAction = ({ label, onClick, disabled, children, danger = false }) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className={`p-1.5 disabled:opacity-30 ${danger ? 'text-red-500' : 'text-gray-500'}`}
  >
    {children}
  </button>
);

/**
 * Quiz authoring for one quiz lesson. Text inputs are Formik fields (saved on blur by the section);
 * structural edits and the correct-answer toggles call `onQuestionsChange(nextQuestions)`, which
 * saves immediately. Option rows follow LMSQuizFormOptions' layout (text + "correct" + remove),
 * copied rather than imported so Certification doesn't couple to LMS quiz code.
 */
const QuizQuestionsEditor = ({ namePrefix, questions = [], disabled, onQuestionsChange }) => {
  const updateQuestion = (qi, updater) =>
    onQuestionsChange(questions.map((question, index) => (index === qi ? updater(question) : question)));

  const setQuestionType = (qi, questionType) =>
    updateQuestion(qi, question => {
      // Switching to single choice keeps only the first correct answer.
      let keptCorrect = false;
      const options =
        questionType === SINGLE_CHOICE
          ? question.options.map(option => {
              const isCorrect = option.is_correct && !keptCorrect;
              keptCorrect = keptCorrect || isCorrect;
              return { ...option, is_correct: isCorrect };
            })
          : question.options;
      return { ...question, question_type: questionType, options };
    });

  const toggleCorrect = (qi, oi) =>
    updateQuestion(qi, question => ({
      ...question,
      options: question.options.map((option, index) => {
        if (question.question_type === SINGLE_CHOICE) return { ...option, is_correct: index === oi };
        return index === oi ? { ...option, is_correct: !option.is_correct } : option;
      }),
    }));

  const updateOptions = (qi, updater) => updateQuestion(qi, question => ({ ...question, options: updater(question.options) }));

  return (
    <div className="md:col-span-2 flex flex-col gap-4 rounded-lg border border-purple-100 bg-purple-50/40 p-4 dark:border-strokedark dark:bg-transparent">
      <h4 className="font-semibold text-gray-800 dark:text-white">Questions</h4>
      {questions.length === 0 ? <p className="text-sm text-gray-500">No questions yet — add the first one below.</p> : null}

      {questions.map((question, qi) => {
        const questionPrefix = `${namePrefix}.questions[${qi}]`;
        const problem = getQuestionProblem(question);
        const isSingle = question.question_type === SINGLE_CHOICE;
        return (
          <div key={question._key || qi} className="rounded-md border border-gray-200 bg-white p-4 dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-gray-800 dark:text-white">Question {qi + 1}</span>
              <div className="flex items-center gap-1">
                <select
                  aria-label={`Question ${qi + 1} type`}
                  value={question.question_type}
                  disabled={disabled}
                  onChange={event => setQuestionType(qi, event.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-strokedark dark:bg-boxdark"
                >
                  {QUESTION_TYPE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <IconAction label="Move question up" disabled={disabled || qi === 0} onClick={() => onQuestionsChange(moveItem(questions, qi, -1))}>
                  <MdKeyboardArrowUp size={18} />
                </IconAction>
                <IconAction label="Move question down" disabled={disabled || qi === questions.length - 1} onClick={() => onQuestionsChange(moveItem(questions, qi, 1))}>
                  <MdKeyboardArrowDown size={18} />
                </IconAction>
                <IconAction label="Remove question" danger disabled={disabled} onClick={() => onQuestionsChange(questions.filter((_, index) => index !== qi))}>
                  <MdDelete size={18} />
                </IconAction>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              <FormikField name={`${questionPrefix}.prompt`} label="Question" placeholder="e.g. Which hormone declines during menopause?" rows={2} disabled={disabled} />

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Options — mark {isSingle ? 'the correct answer' : 'every correct answer'}
                </span>
                {question.options.map((option, oi) => (
                  <div key={option._key || oi} className="flex items-center gap-3">
                    <label className="flex shrink-0 items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <input
                        type={isSingle ? 'radio' : 'checkbox'}
                        name={`${questionPrefix}-correct`}
                        checked={Boolean(option.is_correct)}
                        disabled={disabled}
                        onChange={() => toggleCorrect(qi, oi)}
                        className="h-4 w-4 accent-primary"
                      />
                      Correct
                    </label>
                    <div className="flex-1">
                      <FormikField name={`${questionPrefix}.options[${oi}].text`} placeholder={`Option ${oi + 1}`} disabled={disabled} />
                    </div>
                    <IconAction label="Move option up" disabled={disabled || oi === 0} onClick={() => updateOptions(qi, options => moveItem(options, oi, -1))}>
                      <MdKeyboardArrowUp size={16} />
                    </IconAction>
                    <IconAction label="Move option down" disabled={disabled || oi === question.options.length - 1} onClick={() => updateOptions(qi, options => moveItem(options, oi, 1))}>
                      <MdKeyboardArrowDown size={16} />
                    </IconAction>
                    <IconAction
                      label="Remove option"
                      danger
                      disabled={disabled || question.options.length <= MIN_QUIZ_OPTIONS}
                      onClick={() => updateOptions(qi, options => options.filter((_, index) => index !== oi))}
                    >
                      <RiCloseCircleLine size={20} />
                    </IconAction>
                  </div>
                ))}
                <Button type="button" size="sm" variant="secondary" className="self-start" disabled={disabled} onClick={() => updateOptions(qi, options => [...options, blankOption()])}>
                  Add Option
                </Button>
              </div>

              <FormikField name={`${questionPrefix}.explanation`} label="Explanation (shown with the result)" rows={2} disabled={disabled} />
              {problem ? <p className="text-sm text-amber-700 dark:text-amber-300">{problem}</p> : null}
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" disabled={disabled} onClick={() => onQuestionsChange([...questions, blankQuestion()])}>
          <MdAdd className="mr-1" /> Add Question
        </Button>
        <Button type="button" size="sm" variant="secondary" disabled={disabled} onClick={() => onQuestionsChange([...questions, trueFalseQuestion()])}>
          <MdAdd className="mr-1" /> Add True/False
        </Button>
      </div>
    </div>
  );
};

export default QuizQuestionsEditor;
