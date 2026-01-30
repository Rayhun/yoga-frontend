'use client';
import { useRouter } from 'next/navigation';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import GuidedExperienceForm from '@/components/lms/guided-experiences/GuidedExperienceForm';
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
      <PageHeader title="Add New Live Event">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <GuidedExperienceForm 
        eventType="live event"
        onSuccess={(eventId) => {
          if (eventId) {
            router.push(`/portal/admin/lms/expert/guided-experiences/live-event/${eventId}/details`);
          } else {
            router.push('/portal/admin/lms/expert/guided-experiences/live-event');
          }
        }}
      />
    </div>
  );
};

export default Page;

