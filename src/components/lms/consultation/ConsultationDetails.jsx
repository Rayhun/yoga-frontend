import React from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { enrollConsultation, getConsultationDetails } from '@/services/private/customer/consultation';
import { ConsultationDetails } from '@/components/common/consultation/ConsultationDetails';
import { toast } from 'react-toastify';

export const ConsultationDetailsView = () => {
  const params = useParams();
  const consultationId = params.id;

  const {
    data: response,
    isLoading,
    failureReason,
    refetch,
  } = useQuery({
    queryFn: () => getConsultationDetails({ id: consultationId }),
    queryKey: [queryKeys.consultationDetails, consultationId],
  });

  const { isPending, mutateAsync: enroll } = useMutation({
    mutationFn: enrollConsultation,
  });

  const consultationDetails = response?.data?.data || {};

  useHandleApiResponse(failureReason);

  const handleEnrollConsultation = async () => {
    try {
      await enroll({
        id: consultationId,
      });
      refetch();
      toast.success('enrolled consultation successfully');
    } catch (error) {
      toast.error('Something went wrong while enrolling the consultation');
    }
  };

  return (
    <ConsultationDetails
      isLoading={isLoading}
      consultationDetails={consultationDetails}
      isCustomerView={true}
      consultationId={consultationId}
      handleEnrollConsultation={handleEnrollConsultation}
      enrolling={isPending}
    />
  );
};
