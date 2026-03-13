import React from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { ConsultationDetails } from '@/components/common/consultation/ConsultationDetails';
import { cancelConsultation, completeConsultation, getExpertConsultationDetails } from '@/services/private/expert/consultation';
import useConfirm from '@/hooks/useConfirm';
import { toast } from 'react-toastify';

export const ExpertConsultationDetails = () => {
  const params = useParams();
  const consultationId = params.id;
  const confirm = useConfirm();

  const {
    data: response,
    isLoading,
    failureReason,
    refetch
  } = useQuery({
    queryFn: () => getExpertConsultationDetails({ id: consultationId }),
    queryKey: [queryKeys.expertconsultationDetails, consultationId],
  });

  const { isPending, mutateAsync: cancel } = useMutation({
    mutationFn: cancelConsultation,
  });

  const { isPending: isCompleting, mutateAsync: complete } = useMutation({
    mutationFn: completeConsultation,
  });

  const consultationDetails = response?.data?.data || {};

  useHandleApiResponse(failureReason);

  const handleCancelConsultation = async () => {
    await confirm({ message: 'Are you sure you want to cancel this consultation? This action cannot be undone.' });
    try {
      await cancel({
        id: consultationId,
      });
      refetch();
      toast.success('consultation canceled successfully');
    } catch (error) {
      toast.error('Something went wrong in canceling the consultation');
    }
  };

  const handleConsultationCompletion = async () => {
    await confirm({ message: 'Are you sure you want to complete this consultation? This action cannot be undone.' });
    try {
     await complete({id: consultationId });
      refetch();
      toast.success('Consultation canceled successfully');
    } catch (error) {
      toast.error('Something went wrong in canceling the consultation');
    }
  };

  return (
    <ConsultationDetails
      isLoading={isLoading}
      consultationDetails={consultationDetails}
      consultationId={consultationId}
      handleConsultationCompletion={handleConsultationCompletion}
      canceling={isPending}
      completingConsultation={isCompleting}
      handleCancelConsultation={handleCancelConsultation}
    />
  );
};
