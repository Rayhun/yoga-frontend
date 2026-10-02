'use client';
import { useRouter } from 'next/navigation';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import HomeCoachForm from '@/components/lms/expert/HomeCoachForm';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = () => {
  const router = useRouter();

  const headerActions = [
    {
      id: 'back',
      variant: 'outlined',
      onClick: () => router.back(),
      label: 'Back',
      Icon: MdOutlineArrowBack,
    },
  ];

  return (
    <div>
      <PageHeader title="Add Home Coach Configuration">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <HomeCoachForm />
    </div>
  );
};

export default Page;
