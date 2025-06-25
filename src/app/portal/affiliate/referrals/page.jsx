'use client';
import { useQuery } from '@tanstack/react-query';
import useAuthContext from '@/hooks/useAuthContext';
import queryKeys from '@/utils/query-keys';
import ReferralsDetails from '@/components/affiliates/Referrals';
import PageLoader from '@/components/common/loader/PageLoader';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { getAffiliateUserDetails } from '@/services/private/affiliates/users';

const Page = () => {
  const {
    user: { profile },
  } = useAuthContext();

  const id = profile?.affiliate;

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getAffiliateUserDetails({ id }),
    queryKey: [queryKeys.affiliateUsers, id],
    skip: !id,
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return <ReferralsDetails data={response?.data} />;
};

export default Page;
