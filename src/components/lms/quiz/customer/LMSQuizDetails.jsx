'use client';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import Button from '@/components/common/Button';
import { getSingleQuiz } from '@/services/private/customer/quiz';
import queryKeys from '@/utils/query-keys';
import { ONBOARDING_QUIZ_CONTENT_TYPE } from '@/utils/enums';

const LMSQuizDetails = () => {
  const params = useParams();
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleQuiz({ id: params.id }),
    queryKey: [queryKeys.customerQuizes, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  const quizDetails = response?.data?.data || {};

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
              className="w-full border border-gray-400 rounded-md p-4 flex flex-col gap-2 items-center justify-center hover:border-primary dark:border-white"
            >
              {quizDetails.screen_type === ONBOARDING_QUIZ_CONTENT_TYPE.image ? (
                <Image width={50} height={50} src={option.image_url} alt="image" priority />
              ) : null}
              <span className="text-gray-700 dark:text-gray-400">{option.text}</span>
            </button>
          ))}
        </div>
        <Button size="xl">Submit</Button>
      </div>
    </div>
  );
};

export default LMSQuizDetails;
