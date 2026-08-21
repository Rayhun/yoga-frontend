'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';
import ControllableRichText from '@/components/common/details/ControllableRichText';

const QuizPageDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper
      title="Onboarding Quiz Page"
      onEdit={() => router.push(`/portal/admin/onboarding/quiz/pages/${data.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Title">{data.title}</DetailsRecord>
        <DetailsRecord label="Slug">{data.slug}</DetailsRecord>
        <DetailsRecord label="URL">{data.url}</DetailsRecord>
        <DetailsRecord label="Active">{data.is_active ? 'Yes' : 'No'}</DetailsRecord>
        <DetailsRecord label="Description">
          <ControllableRichText>{data.description || 'No description provided'}</ControllableRichText>
        </DetailsRecord>
        <DetailsRecord label="Questions">
          {(data.questions || []).length > 0 ? (
            <ul className="list-inside list-disc space-y-1">
              {data.questions.map(question => (
                <li key={question.id}>
                  {question.sets_key} — {question.tag_text}
                </li>
              ))}
            </ul>
          ) : (
            'No questions assigned'
          )}
        </DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default QuizPageDetails;
