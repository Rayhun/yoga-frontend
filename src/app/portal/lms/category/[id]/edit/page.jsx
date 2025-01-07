'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import CategoryForm from '@/components/lms/category/CategoryForm';
import { getSingleCategory } from '@/services/private/lms/category';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleCategory({ id: params.id }),
    queryKey: [queryKeys.lmsCategories, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Edit Category" />
      <CategoryForm selected={response?.data?.data} />
    </div>
  );
};

export default Page;
