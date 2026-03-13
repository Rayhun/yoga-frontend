'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import queryKeys from '@/utils/query-keys';
import { getAffiliateUserDetails } from '@/services/private/affiliates/users';
import AffiliateUsersDetails from '@/components/affiliates/AffiliatesUsers/AffiliateUsersDetails';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();
  
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

  const headerActions = [
    {
      id: 'back',
      variant: 'outlined',
      onClick: () => router.back(),
      label: 'Back',
      Icon: MdOutlineArrowBack,
    },
  ];

  return (
    <div>
      <PageHeader title="Affiliate User Details">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <AffiliateUsersDetails data={response?.data} />
    </div>
  );
};

export default Page;