import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { GroupCoachingDetails } from '@/components/common/groupCoaching/GroupCoachingDetailsPage';
import { getGroupCoachingDetails } from '@/services/private/customer/groupCoaching';

export const ExpertGroupCoachingDetails = () => {
  const params = useParams();
  const eventId = params.id;

  const {
    data: response,
    isLoading,
    failureReason,
    refetch,
  } = useQuery({
    queryFn: () => getGroupCoachingDetails({ id: eventId }),
    queryKey: [queryKeys.getexpertGroupCoachingDetails, eventId],
  });

  const eventDetails = response?.data?.data || {};

  useHandleApiResponse(failureReason);

  return (
    <GroupCoachingDetails
      isLoading={isLoading}
      eventDetails={eventDetails}
      isCustomerView={true}
      eventId={eventId}
    />
  );
};
