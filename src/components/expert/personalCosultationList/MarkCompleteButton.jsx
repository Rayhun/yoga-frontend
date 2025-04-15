import React from 'react';
import useConfirm from '@/hooks/useConfirm';
import { completeConsultation } from '@/services/private/expert/consultation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export const MarkCompleteConsultationButton = ({ id }) => {
  const confirm = useConfirm();

  const { isPending: isCompleting, mutateAsync: complete } = useMutation({
    mutationFn: completeConsultation,
  });

  const handleMarkComplete = async () => {
    await confirm({
      message: 'Are you sure you want to complete this consultation? This action cannot be undone.',
    });
    try {
      await complete({ id });
      refetch();
      toast.success('Consultation completed successfully');
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong in completing the consultation');
    }
  };
  return (
    <button
      onClick={handleMarkComplete}
      className="inline-flex items-center justify-center text-primary  text-sm text-center font-medium hover:underline"
      title="Mark as Complete"
    >
      {isCompleting ? 'Completing...' : 'Mark Complete'}
    </button>
  );
};
