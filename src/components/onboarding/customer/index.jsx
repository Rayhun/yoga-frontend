'use client';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { toast } from 'react-toastify';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import Spinner from '@/components/common/loader/Spinner';
import OnboardingQuizQuestion from './OnboardingQuizQuestion';
import { getOnboardingQuiz, submitOnboardingQuiz } from '@/services/private/onboarding';
import queryKeys from '@/utils/query-keys';
import { toastApiError } from '@/utils/helpers';

const CustomerOnboarding = () => {
  const router = useRouter();
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const {
    isLoading: isLoadingOnboardingQuiz,
    data: onboardingQuizResponse,
    failureReason: onboardingQuizFailureReason,
    isSuccess: isOnboardingQuizSuccess,
  } = useQuery({
    queryFn: getOnboardingQuiz,
    queryKey: [queryKeys.onboardingQuiz],
  });
  const { mutateAsync: submitQuiz } = useMutation({
    mutationFn: submitOnboardingQuiz,
  });

  useHandleApiResponse(onboardingQuizFailureReason, isOnboardingQuizSuccess);

  const quizQuestions = useMemo(
    () => onboardingQuizResponse?.data?.onboarding_get?.quiz || [],
    [onboardingQuizResponse]
  );
  const initialValues = useMemo(
    () => quizQuestions.reduce((acc, item) => ({ ...acc, [item.id]: '' }), {}),
    [quizQuestions]
  );
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        ...quizQuestions.reduce(
          (acc, item) => ({
            ...acc,
            [item.id]: item.required ? Yup.string().required('Required') : Yup.string(),
          }),
          {}
        ),
      }),
    [quizQuestions]
  );

  const goToPreviousQuestion = useCallback(() => setSelectedQuestionIndex(prevState => prevState - 1), []);
  const goToNextQuestion = useCallback(() => setSelectedQuestionIndex(prevState => prevState + 1), []);

  const handleSubmitOnboardingQuiz = async values => {
    try {
      const answers = Object.entries(values).map(([keyBy, value]) => ({
        id: keyBy,
        option: value,
      }));

      await submitQuiz({ payload: { answers } });

      toast.success('Onboarding quiz submitted successfully');
      router.push('/portal');
    } catch (error) {
      toastApiError(error);
    }
  };

  const hasPreviousQuestion = selectedQuestionIndex > 0;
  const hasNextQuestion = selectedQuestionIndex < quizQuestions.length - 1;

  if (isLoadingOnboardingQuiz)
    return (
      <div className="mt-5">
        <Spinner />
      </div>
    );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmitOnboardingQuiz}
      enableReinitialize
    >
      <OnboardingQuizQuestion
        question={quizQuestions[selectedQuestionIndex]}
        hasPreviousQuestion={hasPreviousQuestion}
        hasNextQuestion={hasNextQuestion}
        onBack={goToPreviousQuestion}
        onNext={goToNextQuestion}
      />
    </Formik>
  );
};

export default CustomerOnboarding;
