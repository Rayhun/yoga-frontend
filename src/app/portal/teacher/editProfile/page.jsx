'use client';
import { PageHeader } from '@/components/common/page';
import ExpertProfileForm from '@/components/lms/expert/ExpertProfileForm';
import { useExpertContext } from '@/hooks/useExpert';
const Page = () => {
  const { expertData } = useExpertContext();

  return (
    <div>
      <PageHeader title="Create your profile" />
      <ExpertProfileForm selected={expertData} />
    </div>
  );
};

export default Page;
