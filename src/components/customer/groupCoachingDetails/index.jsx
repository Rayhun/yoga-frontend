import React from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { GroupCoachingDetails } from '@/components/common/groupCoaching/GroupCoachingDetailsPage';
import { enrollGroupCoaching, getGroupCoachingDetails } from '@/services/private/customer/groupCoaching';
import { toast } from 'react-toastify';

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

  const { isPending, mutateAsync: enroll } = useMutation({
    mutationFn: enrollGroupCoaching,
  });

  const eventDetails = response?.data?.data || {};

  useHandleApiResponse(failureReason);

  const handleEnrollGroupCoaching = async () => {
    try {
      await enroll({
        id: eventId,
      });
      refetch();
      toast.success('enrolled consultation successfully');
    } catch (error) {
      toast.error('Something went wrong while enrolling the consultation');
    }
  };

  return (
    <GroupCoachingDetails
      isLoading={isLoading}
      eventDetails={eventDetails}
      isCustomerView={true}
      eventId={eventId}
      handleEnrollGroupCoaching={handleEnrollGroupCoaching}
      enrolling={isPending}
    />
  );
};
