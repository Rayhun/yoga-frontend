'use client';
import { PageHeader } from '@/components/common/page';
import ExpertPaymentForm from '@/components/expert/profile/paymentForm';

const Page = () => {
  return (
    <div>
      <PageHeader title="Add your payment information" />
      <ExpertPaymentForm />
    </div>
  );
};

export default Page;
