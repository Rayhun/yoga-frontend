import React from 'react';
import { Chip } from '@mui/material';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  cancelGroupCoaching,
  completeGroupCoaching,
  getExpertGroupCoachingDetails,
} from '@/services/private/expert/groupCoaching';
import queryKeys from '@/utils/query-keys';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { GroupCoachingDetails } from '@/components/common/groupCoaching/GroupCoachingDetailsPage';
import useConfirm from '@/hooks/useConfirm';
import { toast } from 'react-toastify';
import Popup from '@/components/common/popup';
import useToggle from '@/hooks/useToggle';
import MarkCompleteForm from '@/components/common/MarkCompleteForm';

export const ExpertGroupCoachingDetails = () => {
  const params = useParams();
  const eventId = params.id;
  const confirm = useConfirm();
  const { isOpen: isCompletionModalOpen, toggle: toggleCompletionModal } = useToggle();

  const {
    data: response,
    isLoading,
    failureReason,
    refetch,
  } = useQuery({
    queryFn: () => getExpertGroupCoachingDetails({ id: eventId }),
    queryKey: [queryKeys.expertGroupCoachingDetails, eventId],
  });

  const { isPending, mutateAsync: cancelEvent } = useMutation({
    mutationFn: cancelGroupCoaching,
  });

  const { isPending: isCompleting, mutateAsync: completeEvent } = useMutation({
    mutationFn: completeGroupCoaching,
  });

  const eventDetails = response?.data?.data || {};

  useHandleApiResponse(failureReason);

  const handleCancelEvent = async () => {
    await confirm({ message: 'Are you sure you want to cancel this event? This action cannot be undone.' });
    try {
      await cancelEvent({
        id: eventId,
      });
      refetch();
      toast.success('Event canceled successfully');
    } catch (error) {
      toast.error('Something went wrong in canceling the event');
    }
  };

  const handleEventCompletion = async (values, { setSubmitting }) => {
    try {
      await completeEvent({ ...values, id: eventId });
      refetch();
      toast.success('Event canceled successfully');
    } catch (error) {
      toast.error('Something went wrong in canceling the event');
    } finally {
      setSubmitting(false);
      toggleCompletionModal();
    }
  };

  return (
    <>
      <GroupCoachingDetails
        eventDetails={eventDetails}
        isLoading={isLoading}
        eventId={eventId}
        handleCancelEvent={handleCancelEvent}
        canceling={isPending}
        completingEvent={isCompleting}
        toggleCompletionModal={toggleCompletionModal}
      />
      <Popup heading={null} open={isCompletionModalOpen} onClose={() => toggleCompletionModal()}>
        <MarkCompleteForm handleSubmit={handleEventCompletion} toggleCompletionModal={toggleCompletionModal} />
      </Popup>
    </>
  );
};
