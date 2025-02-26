'use client';
import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import Button from '@/components/common/Button';
import { completeProgramContent } from '@/services/private/customer/program';
import { ONBOARDING_QUIZ_CONTENT_TYPE } from '@/utils/enums';

const LMSQuizDetails = ({ data: quizDetails }) => {
  const searchParams = useSearchParamUtils();
  const programID = searchParams.get('program');
  const moduleID = searchParams.get('module');

  const [selectedOption, setSelectedOption] = useState({});

  const { isPending: isSubmittingQuiz, mutateAsync: submitQuiz } = useMutation({
    mutationFn: completeProgramContent,
  });

  const handleSubmitQuiz = async (req, res) => {
    try {
      await submitQuiz({
        id: programID,
        module: moduleID,
        content_type: 'Quiz',
        content_id: quizDetails.id,
      });
      toast.success('Quiz submitted successfully');
    } catch (error) {
      toast.error('Something went wrong in submitting quiz');
    }
  };

  return (
    <div>
      {/* Details Card */}
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-6 p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
        <h2 className="text-3xl text-center font-bold text-gray-800 dark:text-white">{quizDetails.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-center">{quizDetails.description}</p>
        <div className="w-full md:w-1/2 lg:1/3 flex flex-col gap-3">
          {quizDetails.options?.map(option => (
            <button
              key={option.text}
              className={`w-full border border-gray-400 rounded-md p-4 flex flex-col gap-2 items-center justify-center hover:border-primary dark:border-white ${
                option.text === selectedOption.text ? 'bg-primary text-white' : ''
              }`}
              onClick={() => setSelectedOption(option)}
            >
              {quizDetails.screen_type === ONBOARDING_QUIZ_CONTENT_TYPE.image ? (
                <Image width={50} height={50} src={option.image_url} alt="image" priority />
              ) : null}
              <span>{option.text}</span>
            </button>
          ))}
        </div>
        <Button size="xl" isLoading={isSubmittingQuiz} disabled={isSubmittingQuiz} onClick={handleSubmitQuiz}>
          {isSubmittingQuiz ? 'Submitting' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

export default LMSQuizDetails;
