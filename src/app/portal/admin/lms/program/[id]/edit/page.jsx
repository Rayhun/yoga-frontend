'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import ProgramForm from '@/components/lms/program/admin/ProgramForm';
import { getSingleProgram } from '@/services/private/lms/program';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleProgram({ id: params.id }),
    queryKey: [queryKeys.lmsPrograms, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Edit Program" />
      <ProgramForm selected={response?.data?.data} />
    </div>
  );
};

export default Page;
