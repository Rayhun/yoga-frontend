'use client';
import { useQuery } from '@tanstack/react-query';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';
import { getSingleQuiz } from '@/services/private/lms/quiz';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleQuiz({ id: params.id }),
    queryKey: [queryKeys.lmsQuizes, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  const quizDetails = response?.data?.data || {};

  return (
    <div>
      <PageHeader title="Quiz Details" />
      <DetailsLayoutWrapper title="Quiz">
        <div className="flex flex-col gap-5">
          <DetailsRecord label="Title">{quizDetails.title}</DetailsRecord>
          <DetailsRecord label="Quiz Number">{quizDetails.quiz_number}</DetailsRecord>
          <DetailsRecord label="Explanation">{quizDetails.explanation}</DetailsRecord>
          <DetailsRecord label="Status">{quizDetails.status}</DetailsRecord>
          <DetailsRecord label="Difficulty">{quizDetails.difficulty}</DetailsRecord>
          <DetailsRecord label="Intensity">{quizDetails.intensity}</DetailsRecord>
          <DetailsRecord label="Access Setting">{quizDetails.access_setting}</DetailsRecord>
          <DetailsRecord label="Visibility Setting">{quizDetails.visibility_setting}</DetailsRecord>
          <DetailsRecord label="Focus Areas">
            <div className="flex gap-2">
              {quizDetails.focus_areas?.map(label => (
                <Chip
                  key={label}
                  label={label}
                  className="bg-gray-300 text-black-2 dark:text-white dark:bg-primary"
                />
              ))}
            </div>
          </DetailsRecord>
          <DetailsRecord label="Equipments">
            <div className="flex gap-2">
              {quizDetails.equipments?.map(label => (
                <Chip
                  key={label}
                  label={label}
                  className="bg-gray-300 text-black-2 dark:text-white dark:bg-primary"
                />
              ))}
            </div>
          </DetailsRecord>
          <DetailsRecord label="Languages">
            <div className="flex gap-2">
              {quizDetails.languages?.map(label => (
                <Chip
                  key={label}
                  label={label}
                  className="bg-gray-300 text-black-2 dark:text-white dark:bg-primary"
                />
              ))}
            </div>
          </DetailsRecord>
          <DetailsRecord label="Categories">
            <div className="flex gap-2">
              {quizDetails.categories?.map(category => (
                <Chip
                  key={category.id}
                  label={category.name}
                  className="bg-gray-300 text-black-2 dark:text-white dark:bg-primary"
                />
              ))}
            </div>
          </DetailsRecord>
          <DetailsRecord label="Tags">
            <div className="flex gap-2">
              {quizDetails.tags?.map(tag => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  className="bg-gray-300 text-black-2 dark:text-white dark:bg-primary"
                />
              ))}
            </div>
          </DetailsRecord>
        </div>
      </DetailsLayoutWrapper>
    </div>
  );
};

export default Page;
