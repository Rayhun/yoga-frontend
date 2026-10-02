'use client';
import { PageHeader } from '@/components/common/page';
import GroupCoachingForm from '@/components/common/groupCoaching/GroupCoachingFrom';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import PageLoader from '@/components/common/loader/PageLoader';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { getExpertGroupCoachingDetails } from '@/services/private/expert/groupCoaching';

const Page = () => {
  const searchParams = useSearchParams();
  const copyFromId = searchParams.get('copy_from');

  const { data: copyResponse, isLoading, failureReason } = useQuery({
    queryFn: () => getExpertGroupCoachingDetails({ id: copyFromId }),
    queryKey: [queryKeys.expertGroupCoachingDetails, 'copy', copyFromId],
    enabled: Boolean(copyFromId),
  });

  useHandleApiResponse(failureReason);

  if (copyFromId && isLoading) return <PageLoader />;

  const copiedInitialData = copyResponse?.data?.data || {};

  return (
    <div>
      <PageHeader title="Host a Workshop, Bootcamp, or Live Group Coaching" />
      <GroupCoachingForm initialData={copiedInitialData} />
    </div>
  );
};

export default Page;