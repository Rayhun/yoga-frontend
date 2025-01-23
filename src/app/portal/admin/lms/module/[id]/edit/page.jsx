'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import ModuleForm from '@/components/lms/module/admin/ModuleForm';
import { getSingleModule } from '@/services/private/lms/module';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleModule({ id: params.id }),
    queryKey: [queryKeys.lmsModules, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Edit Module" />
      <ModuleForm selected={response?.data?.data} />
    </div>
  );
};

export default Page;
