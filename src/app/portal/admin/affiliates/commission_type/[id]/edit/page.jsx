'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import queryKeys from '@/utils/query-keys';
import { getCommissionTypeDetails } from '@/services/private/affiliates/commission';
import CommissionTypeForm from '@/components/affiliates/CommissionTypes/CommissionTypeForm';

const Page = ({ params }) => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getCommissionTypeDetails({ id: params.id }),
    queryKey: [queryKeys.commissionTypeList, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Edit Commission Type" />
      <CommissionTypeForm selected={response?.data} />
    </div>
  );
};

export default Page;
