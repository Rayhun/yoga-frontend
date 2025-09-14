'use client';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { toast } from 'react-toastify';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import OnboardingQuizQuestion from './OnboardingQuizQuestion';
import { getQuizesList, submitQuiz } from '@/services/private/onboarding/quiz';
import queryKeys from '@/utils/query-keys';
import { toastApiError } from '@/utils/helpers';

const CustomerOnboarding = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const {
    isLoading: isLoadingOnboardingQuiz,
    data: onboardingQuizResponse,
    failureReason: onboardingQuizFailureReason,
    isSuccess: isOnboardingQuizSuccess,
  } = useQuery({
    queryFn: getQuizesList,
    queryKey: [queryKeys.onboardingQuiz],
  });
  const { mutateAsync: submitOnboardingQuiz } = useMutation({
    mutationFn: submitQuiz,
  });

  useHandleApiResponse(onboardingQuizFailureReason, isOnboardingQuizSuccess);

  const quizQuestions = useMemo(
    () => onboardingQuizResponse?.data?.onboarding_get?.quiz || onboardingQuizResponse?.data || [],
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
      const answers = Object.entries(values).map(([questionId, selectedOptionText]) => {
        // Find the question to get the selected option details
        const question = quizQuestions.find(q => q.id.toString() === questionId);
        const selectedOption = question?.options?.find(opt => opt.text === selectedOptionText);
        
        return {
          id: questionId,
          option_text: selectedOptionText,
          option_id: selectedOption?.id || null,
        };
      });

      await submitOnboardingQuiz({ payload: { answers } });

      // Refresh user data to update on_boarding_quiz status
      await queryClient.invalidateQueries([queryKeys.loggedInUser]);
      
      // Refetch user data to ensure it's updated
      await queryClient.refetchQueries([queryKeys.loggedInUser]);

      toast.success('Onboarding quiz submitted successfully');
      router.push('/portal');
    } catch (error) {
      toastApiError(error);
    }
  };

  const hasPreviousQuestion = selectedQuestionIndex > 0;
  const hasNextQuestion = selectedQuestionIndex < quizQuestions.length - 1;

  if (isLoadingOnboardingQuiz) return <PageLoader />;

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
