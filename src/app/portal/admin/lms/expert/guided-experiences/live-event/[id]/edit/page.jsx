'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import GuidedExperienceForm from '@/components/lms/guided-experiences/GuidedExperienceForm';
import { getSingleGuidedExperience } from '@/services/private/lms/guided-experiences';
import queryKeys from '@/utils/query-keys';
import { MdOutlineArrowBack } from 'react-icons/md';

const Page = ({ params }) => {
  const router = useRouter();
  
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleGuidedExperience({ id: params.id }),
    queryKey: [queryKeys.guidedExperiences, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

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
      <PageHeader title="Edit Live Event">
        <PageHeaderQuickActions actions={headerActions} />
      </PageHeader>
      <GuidedExperienceForm 
        selected={response?.data?.data} 
        eventType="live event"
        onSuccess={() => router.push(`/portal/admin/lms/expert/guided-experiences/live-event/${params.id}/details`)}
      />
    </div>
  );
};

export default Page;

