'use client';
import { useRouter } from 'next/navigation';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';

const FrequentlyAskedQuestionDetails = ({ data = {} }) => {
  const router = useRouter();

  return (
    <DetailsLayoutWrapper
      title="Frequently Asked Question"
      onEdit={() => router.push(`/portal/admin/faq/${data?.id}/edit`)}
    >
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Question">{data?.title}</DetailsRecord>
        <DetailsRecord label="Answer">{data?.description}</DetailsRecord>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default FrequentlyAskedQuestionDetails;