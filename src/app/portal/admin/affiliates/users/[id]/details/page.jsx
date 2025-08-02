'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import queryKeys from '@/utils/query-keys';
import { getAffiliateUserDetails } from '@/services/private/affiliates/users';
import AffiliateUsersDetails from '@/components/affiliates/AffiliatesUsers/AffiliateUsersDetails';

const Page = ({ params }) => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getAffiliateUserDetails({ id: params.id }),
    queryKey: [queryKeys.affiliateUsers, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Affiliate User Details" />
      <AffiliateUsersDetails data={response?.data} />
    </div>
  );
};

export default Page;