import React from 'react';
import useConfirm from '@/hooks/useConfirm';
import { cancelConsultation, completeConsultation } from '@/services/private/expert/consultation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useToggle from '@/hooks/useToggle';
import MarkCompleteForm from '@/components/common/MarkCompleteForm';
import Popup from '@/components/common/popup';

export const Actions = ({ id }) => {
  const confirm = useConfirm();
  const { isOpen: isCompletionModalOpen, toggle: toggleCompletionModal } = useToggle();
  const { isPending: isCompleting, mutateAsync: complete } = useMutation({
    mutationFn: completeConsultation,
  });

  const { isPending, mutateAsync: cancel } = useMutation({
    mutationFn: cancelConsultation,
  });

  const handleMarkComplete = async (values, { setSubmitting }) => {
    try {
      await complete({ id, ...values });
      refetch();
      toast.success('Consultation completed successfully');
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong in completing the consultation');
    }
  };

  const handleCancelConsultation = async () => {
    await confirm({ message: 'Are you sure you want to cancel this consultation? This action cannot be undone.' });
    try {
      await cancel({
        id: id,
      });
      refetch();
      toast.success('consultation canceled successfully');
    } catch (error) {
      toast.error('Something went wrong in canceling the consultation');
    }
  };

  const handleMarkClick = () => toggleCompletionModal();
  return (
    <>
      <div className='flex gap-4'>
        <button
          onClick={handleCancelConsultation}
          className="inline-flex items-center justify-center text-red-500  text-sm text-center font-medium hover:underline"
          title="Mark as Complete"
        >
          {isCompleting ? 'Cenceling' : 'Cancel'}
        </button>
        <button
          onClick={handleMarkClick}
          className="inline-flex items-center justify-center text-primary  text-sm text-center font-medium hover:underline"
          title="Mark as Complete"
        >
          {isCompleting ? 'Completing...' : 'Complete'}
        </button>
      </div>
      <Popup heading="Complete Coaching" open={isCompletionModalOpen} onClose={() => toggleCompletionModal()}>
        <MarkCompleteForm handleSubmit={handleMarkComplete} />
      </Popup>
    </>
  );
};
