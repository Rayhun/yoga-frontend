'use client';
import { PageHeader } from '@/components/common/page';
import ExpertPaymentForm from '@/components/expert/profile/paymentForm';

const Page = () => {
  return (
    <div>
      <PageHeader title="Payments" />
      <ExpertPaymentForm />
    </div>
  );
};

export default Page;
