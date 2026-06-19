import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelGroupCoaching,
  completeGroupCoaching,
  deleteGroupCoaching,
  getExpertGroupCoachingDetails,
} from '@/services/private/expert/groupCoaching';
import queryKeys from '@/utils/query-keys';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { GroupCoachingDetails } from '@/components/common/groupCoaching/GroupCoachingDetailsPage';
import useConfirm from '@/hooks/useConfirm';
import { toast } from 'react-toastify';
import { toastApiError } from '@/utils/helpers';
import Popup from '@/components/common/popup';
import useToggle from '@/hooks/useToggle';
import MarkCompleteForm from '@/components/common/MarkCompleteForm';

const EVENT_DELETE_BLOCKED_MESSAGE =
  'This event cannot be deleted because users have signed up or tickets have been sold. Please refund or cancel all orders before deleting this event.';

export const ExpertGroupCoachingDetails = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id;
  const confirm = useConfirm();
  const queryClient = useQueryClient();
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

  const { isPending: isDeleting, mutateAsync: deleteEvent } = useMutation({
    mutationFn: deleteGroupCoaching,
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

  const handleDeleteEvent = async () => {
    if (!eventDetails.can_delete) {
      toast.error(eventDetails.delete_blocked_message || EVENT_DELETE_BLOCKED_MESSAGE);
      return;
    }

    try {
      await confirm({
        heading: 'Delete event?',
        message: 'Are you sure you want to delete this event? This action cannot be undone.',
      });
      await deleteEvent({ id: eventId });
      await queryClient.invalidateQueries({ queryKey: [queryKeys.expertGroupCoaching] });
      toast.success('Event deleted successfully');
      router.push('/portal/teacher/profile?tab=group_coaching');
    } catch (error) {
      if (error?.message !== 'User cancelled') {
        toastApiError(error);
      }
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

  const handleDuplicateEvent = async () => {
    router.push(`/portal/teacher/group_coaching/add?copy_from=${eventId}`);
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
        handleDuplicateEvent={handleDuplicateEvent}
        duplicating={false}
        handleDeleteEvent={handleDeleteEvent}
        deleting={isDeleting}
      />
      <Popup heading={null} open={isCompletionModalOpen} onClose={() => toggleCompletionModal()}>
        <MarkCompleteForm handleSubmit={handleEventCompletion} toggleCompletionModal={toggleCompletionModal} />
      </Popup>
    </>
  );
};
