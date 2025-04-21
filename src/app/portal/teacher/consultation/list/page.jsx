'use client';
import { PageHeader } from '@/components/common/page';
import PersonalConsultationList from '@/components/expert/personalCosultationList';
const Page = () => {

  return (
    <div>
      <PageHeader title="Personal Consultations List" />
      <PersonalConsultationList />
    </div>
  );
};

export default Page;