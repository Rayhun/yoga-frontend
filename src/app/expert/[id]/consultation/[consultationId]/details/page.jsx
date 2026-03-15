import { PageHeader } from '@/components/common/page';
import PublicConsultationDetails from '@/components/public/consultationDetails';

const Page = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader title="Personal Consultation Details" />
      <PublicConsultationDetails />
    </div>
  );
};

export default Page;
