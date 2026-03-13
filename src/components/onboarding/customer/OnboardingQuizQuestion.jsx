'use client';
import Image from 'next/image';
import { useField, useFormikContext } from 'formik';
import Button from '@/components/common/Button';
import { ONBOARDING_QUIZ_CONTENT_TYPE } from '@/utils/enums';
import ControllableRichText from '@/components/common/details/ControllableRichText';

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
    <>
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto p-6 md:p-8 min-h-[600px] flex flex-col justify-between">
          <div className="flex-1 flex flex-col">
            {/* Skip button */}
            <div className="flex justify-end mb-6">
              <button
                className="group relative px-6 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                disabled={question.required || !hasNextQuestion}
                onClick={handleSkip}
              >
                <span className="relative z-10">Skip this question</span>
                <div className="absolute inset-0 bg-green-100 dark:bg-green-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-0 group-hover:scale-100"></div>
              </button>
            </div>

            {/* Question header */}
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">?</span>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-3 leading-tight">
                {question.title}
              </h2>
              
              <div className="max-w-2xl mx-auto">
                <ControllableRichText className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {question.description || 'No description provided'}
                </ControllableRichText>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 flex-1">
              {question.options?.map((option, index) => (
                <button
                  key={option.text}
                  className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                    field.value === option.text
                      ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-2xl shadow-green-500/25'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 shadow-lg hover:shadow-xl'
                  }`}
                  onClick={() => handleSelectOption(option.text)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    {question.screen_type === ONBOARDING_QUIZ_CONTENT_TYPE.image && (
                      <div className="relative">
                        <div className={`p-3 rounded-2xl ${
                          field.value === option.text 
                            ? 'bg-white/20' 
                            : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600'
                        }`}>
                          <img 
                            width={50} 
                            height={50} 
                            src={option.image_url} 
                            alt="option image" 
                            className="rounded-lg object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <span className={`text-base font-semibold text-center leading-relaxed ${
                      field.value === option.text 
                        ? 'text-white' 
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {option.text}
                    </span>
                  </div>

                  {/* Selection indicator */}
                  {field.value === option.text && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
            <Button 
              variant="secondary" 
              disabled={!hasPreviousQuestion} 
              onClick={onBack}
              className="w-full sm:w-auto min-w-[120px] h-12 rounded-xl font-semibold transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
            
            <Button 
              disabled={question.required ? !field.value : false} 
              onClick={handleSubmitAnswer}
              className="w-full sm:w-auto min-w-[120px] h-12 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl"
            >
              {hasNextQuestion ? 'Continue' : 'Complete Quiz'}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default OnboardingQuizQuestion;
