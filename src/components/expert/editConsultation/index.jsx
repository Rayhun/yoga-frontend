import React from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { ConsultationDetails } from '@/components/common/consultation/ConsultationDetails';
import { getExpertConsultationDetails } from '@/services/private/expert/consultation';
import { toast } from 'react-toastify';
import ConsultationForm from '@/components/common/consultation/ConsultationForm';
import PageLoader from '@/components/common/loader/PageLoader';


export const EditExpertConsultation = () => {
  const params = useParams();
  const consultationId = params.id;

  const {
    data: response,
    isLoading,
    failureReason,
    refetch
  } = useQuery({
    queryFn: () => getExpertConsultationDetails({ id: consultationId }),
    queryKey: [queryKeys.expertconsultationDetails, consultationId],
  });
  const consultationDetails = response?.data?.data || {};

  useHandleApiResponse(failureReason);

  if(isLoading) return <PageLoader />

  return (
    <ConsultationForm
      initialData={consultationDetails}
      consultationId={consultationId}
      isEditMode={true}
    />
  );
};
