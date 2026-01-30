'use client';
import { useRouter } from 'next/navigation';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import StaffUserForm from '@/components/entities/staff/StaffUserForm';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
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
      <PageHeader title="Edit Staff User">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <StaffUserForm staffUserId={params.id} />
    </div>
  );
};

export default Page;
