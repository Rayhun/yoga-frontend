'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { MdOutlineArrowBack } from 'react-icons/md';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import CouponDetails from '@/components/subscription/coupon/admin/CouponDetails';
import { getSingleCoupon } from '@/services/private/subscription/coupon';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const router = useRouter();

  const { data: response, isLoading, failureReason } = useQuery({
    queryFn: () => getSingleCoupon({ id: params.id }),
    queryKey: [queryKeys.coupons, params.id],
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
      <PageHeader title="Coupon Details">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <CouponDetails data={response?.data?.data ?? response?.data} />
    </div>
  );
};

export default Page;
