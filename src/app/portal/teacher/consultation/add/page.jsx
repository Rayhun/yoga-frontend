'use client';
import { PageHeader } from '@/components/common/page';
import ConsultationForm from '@/components/common/consultation/ConsultationForm';
const Page = () => {

  return (
    <div>
      <PageHeader title="Create a 1:1 Consultation Offer" />
      <ConsultationForm />
    </div>
  );
};

export default Page;