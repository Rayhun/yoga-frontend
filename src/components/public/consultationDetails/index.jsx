'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import { ConsultationDetails } from '@/components/common/consultation/ConsultationDetails';
import { getPublicConsultationDetail } from '@/services/public/expert';
import useGeoLocation from '@/hooks/useGeoLocation';
import { toast } from 'react-toastify';

const ALLOWED_COUNTRIES = ['US', 'CA', 'IN'];

const PublicConsultationDetails = () => {
  const params = useParams();
  const router = useRouter();
  const consultationId = params?.consultationId;

  const { countryCode, isLoading: isGeoLoading } = useGeoLocation();
  const isDev = process.env.NEXT_PUBLIC_APP_ENVRONMENT === 'development';

  const { data: response, isLoading } = useQuery({
    queryFn: () => getPublicConsultationDetail({ id: consultationId }),
    queryKey: [queryKeys.publicExpertConsultationDetails, consultationId],
    enabled: !!consultationId,
  });

  const consultationDetails = response?.data?.data || {};

  const handlePublicBuyNow = () => {
    if (isGeoLoading) {
      toast.info('Detecting your location...');
      return;
    }

    if (!isDev && (!countryCode || !ALLOWED_COUNTRIES.includes(countryCode))) {
      toast.error('We currently only support purchases from the United States, Canada, and India.');
      return;
    }

    router.push(`/payment/guest/consultation/${consultationId}`);
  };

  return (
    <ConsultationDetails
      isLoading={isLoading}
      consultationDetails={consultationDetails}
      consultationId={consultationId}
      isPublicView={true}
      handlePublicBuyNow={handlePublicBuyNow}
      guestCheckoutLoading={isGeoLoading}
    />
  );
};

export default PublicConsultationDetails;
