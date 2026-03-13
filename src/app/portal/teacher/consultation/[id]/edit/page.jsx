'use client';
import { PageHeader } from '@/components/common/page';
import { EditExpertConsultation } from '@/components/expert/editConsultation';

const Page = () => {
  return (
    <div>
      <PageHeader title="Edit Consultation" />
      <EditExpertConsultation />
    </div>
  );
};

export default Page;
