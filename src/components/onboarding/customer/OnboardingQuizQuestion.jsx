'use client';
import Image from 'next/image';
import { useField, useFormikContext } from 'formik';
import Button from '@/components/common/Button';
import { ONBOARDING_QUIZ_CONTENT_TYPE } from '@/utils/enums';

const OnboardingQuizQuestion = ({
  question = {},
  hasPreviousQuestion,
  hasNextQuestion,
  onBack = () => null,
  onNext = () => null,
}) => {
  const [field] = useField(question.id);
  const { setFieldValue, submitForm } = useFormikContext();

  const handleSubmitAnswer = async () => {
    if (!hasNextQuestion) {
      await submitForm();
      return;
    }

    if (!question.required || field.value) {
      onNext();
    }
  };

  const handleSkip = () => {
    if (!question.required) onNext();
  };

  const handleSelectOption = value => {
    setFieldValue(question.id, value);
  };

  return (
    <div className="w-full md:w-2/3 flex flex-col p-6">
      <div className="mt-12 flex flex-col gap-1">
        <button
          className="text-gray-500 dark:text-gray-400 mb-7 text-sm self-end disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={question.required || !hasNextQuestion}
          onClick={handleSkip}
        >
          Skip
        </button>
        <h2 className="text-3xl text-center font-bold text-gray-800 dark:text-white">{question.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-center">{question.description}</p>
      </div>

      <div className="flex justify-center items-center flex-wrap gap-4 mt-8">
        {question.options?.map(option => (
          <button
            key={option.text}
            className={`w-full md:w-1/4 border rounded-md p-4 flex flex-col gap-2 items-center justify-center hover:border-primary focus:ring-primary ${
              field.value === option.text ? 'border-primary' : ''
            }`}
            onClick={() => handleSelectOption(option.text)}
          >
            {question.screen_type === ONBOARDING_QUIZ_CONTENT_TYPE.image ? (
              <Image width={50} height={50} src={option.image_url} alt="image" priority />
            ) : null}
            <span className="text-gray-700 dark:text-gray-400">{option.text}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button variant="secondary" disabled={!hasPreviousQuestion} onClick={onBack}>
          Back
        </Button>
        <Button disabled={question.required ? !field.value : false} onClick={handleSubmitAnswer}>
          {hasNextQuestion ? 'Continue' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingQuizQuestion;
