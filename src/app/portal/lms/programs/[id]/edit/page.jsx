'use client';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import ExpertForm from '@/components/lms/experts/ExpertForm';
import { getSingleExpert } from '@/services/private/lms/experts';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const { data: response, isLoading } = useQuery({
    queryFn: () => getSingleExpert({ id: params.id }),
    queryKey: [queryKeys.lmsExperts, params.id],
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Edit Expert" />
      <ExpertForm selected={response?.data?.data} />
    </div>
  );
};

export default Page;
