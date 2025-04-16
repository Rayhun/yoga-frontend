'use client';
import { PageHeader } from '@/components/common/page';
import ConsultationForm from '@/components/common/consultation/ConsultationForm';
const Page = () => {

  return (
    <div>
      <PageHeader title="Ready to offer life-changing session?" />
      <ConsultationForm />
    </div>
  );
};

export default Page;