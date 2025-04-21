import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import { getExpertGroupCoachingDetails } from '@/services/private/expert/groupCoaching';
import GroupCoachingForm from '@/components/common/groupCoaching/GroupCoachingFrom';


export const EditExpertGroupCoaching = () => {
  const params = useParams();
  const eventId = params.id;

  const {
    data: response,
    isLoading,
    failureReason,
    refetch,
  } = useQuery({
    queryFn: () => getExpertGroupCoachingDetails({ id: eventId }),
    queryKey: [queryKeys.expertGroupCoachingDetails, eventId],
  });

  useHandleApiResponse(failureReason);

  if(isLoading) return <PageLoader />

  const eventDetails = response?.data?.data || {};

  return (
    <GroupCoachingForm
      initialData={eventDetails}
      eventId={eventId}
      isEditMode={true}
    />
  );
};
