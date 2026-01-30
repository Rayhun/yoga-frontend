'use client';
import { useRouter } from 'next/navigation';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import LookupItemForm from '@/components/lms/lookup-item/LookupItemForm';
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
      <PageHeader title="Add New Lookup Item">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <LookupItemForm />
    </div>
  );
};

export default Page;

