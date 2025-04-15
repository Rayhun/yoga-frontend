import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { getConsultationDetails } from '@/services/private/customer/consultation';
import { ConsultationDetails } from '@/components/common/consultation/ConsultationDetails';

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

  const consultationDetails = response?.data?.data || {};

  useHandleApiResponse(failureReason);

  return (
    <ConsultationDetails
      isLoading={isLoading}
      consultationDetails={consultationDetails}
      isCustomerView={true}
      consultationId={consultationId}
    />
  );
};
