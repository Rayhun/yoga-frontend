'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';
import { ONBOARDING_QUIZ_CONTENT_TYPE } from '@/utils/enums';

const OnboardingQuizDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper
      title="Quiz"
      onEdit={() => router.push(`/portal/admin/onboarding/quiz/${data.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Type">{data.screen_type}</DetailsRecord>
        <DetailsRecord label="Description">{data.description}</DetailsRecord>
        <DetailsRecord label="Is Required">{data.required ? 'Yes' : 'No'}</DetailsRecord>
        <DetailsRecord label="Options">
          <div className="flex flex-wrap gap-2">
            {data.options?.map(option => (
              <div
                key={option.text}
                className="w-full md:w-1/5 border rounded-md p-2 flex flex-col gap-2 items-center justify-center"
              >
                {data.screen_type === ONBOARDING_QUIZ_CONTENT_TYPE.image ? (
                  <Image width={50} height={50} src={option.image_url} alt="image" priority />
                ) : null}
                <span className="text-gray-700 dark:text-gray-400 text-sm">{option.text}</span>
              </div>
            ))}
          </div>
        </DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default OnboardingQuizDetails;
