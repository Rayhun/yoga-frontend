import { PageHeader } from '@/components/common/page';
import CouponsList from '@/components/subscription/coupon/admin/CouponsList';

export const metadata = {
  title: 'Coupons',
};

const Page = () => {
  return (
    <div>
      <CouponsList />
    </div>
  );
};

export default Page;
