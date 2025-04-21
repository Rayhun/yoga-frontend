'use client';
import { PageHeader } from '@/components/common/page';
import { ExpertConsultationDetails } from '@/components/expert/consultationDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Consultation Details" />
      <ExpertConsultationDetails />
    </div>
  );
};

export default Page;
