'use client';
import { PageHeader } from '@/components/common/page';
import { ConsultationDetailsView } from '@/components/lms/consultation/ConsultationDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Personal Consultation Details" />
      <ConsultationDetailsView isCustomerView={true} />
    </div>
  );
};

export default Page;
