'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Reset selectedQuestionIndex if it's out of bounds
  useEffect(() => {
    if (quizQuestions.length > 0 && selectedQuestionIndex >= quizQuestions.length) {
      setSelectedQuestionIndex(0);
    }
  }, [quizQuestions.length, selectedQuestionIndex]);

  const handleSubmitOnboardingQuiz = async values => {
    try {
      setIsSubmitting(true);
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

      toast.success('🎉 Welcome! Your onboarding is complete');
      router.push('/portal');
    } catch (error) {
      toastApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPreviousQuestion = selectedQuestionIndex > 0;
  const hasNextQuestion = selectedQuestionIndex < quizQuestions.length - 1;

  // Modern loading state
  if (isLoadingOnboardingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-gray-600 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-green-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-600 dark:text-gray-400 animate-pulse">
            Preparing your personalized quiz...
          </p>
        </div>
      </div>
    );
  }

  // Enhanced empty state
  if (!quizQuestions || quizQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="p-12 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            No Quiz Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We're currently preparing your personalized onboarding experience. Please check back soon or contact our support team for assistance.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:scale-105"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Onboarding Quiz
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Question {selectedQuestionIndex + 1} of {quizQuestions.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {Math.round(((selectedQuestionIndex + 1) / quizQuestions.length) * 100)}% Complete
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((selectedQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-18">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmitOnboardingQuiz}
          enableReinitialize
        >
          {({ isSubmitting: formikSubmitting }) => (
            <div className="relative">
              {(isSubmitting || formikSubmitting) && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl text-center">
                    <div className="w-16 h-16 border-4 border-green-200 dark:border-gray-600 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      Submitting Your Responses
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Please wait while we process your quiz...
                    </p>
                  </div>
                </div>
              )}
              
              <OnboardingQuizQuestion
                question={quizQuestions[selectedQuestionIndex]}
                hasPreviousQuestion={hasPreviousQuestion}
                hasNextQuestion={hasNextQuestion}
                onBack={goToPreviousQuestion}
                onNext={goToNextQuestion}
              />
            </div>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CustomerOnboarding;
