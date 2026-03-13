'use client';
import { useRouter } from 'next/navigation';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import ExpertCommissionForm from '@/components/lms/expert/ExpertCommissionForm';
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
      <PageHeader title="Add Expert Commission">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <ExpertCommissionForm />
    </div>
  );
};

export default Page;
