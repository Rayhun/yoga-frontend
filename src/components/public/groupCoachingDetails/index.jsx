'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import { GroupCoachingDetails } from '@/components/common/groupCoaching/GroupCoachingDetailsPage';
import { getPublicGroupCoachingDetail } from '@/services/public/expert';
import useGeoLocation from '@/hooks/useGeoLocation';
import { toast } from 'react-toastify';

const ALLOWED_COUNTRIES = ['US', 'CA', 'IN'];

const PublicGroupCoachingDetails = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId;

  const { countryCode, isLoading: isGeoLoading } = useGeoLocation();
  const isDev = process.env.NEXT_PUBLIC_APP_ENVRONMENT === 'development';

  const { data: response, isLoading } = useQuery({
    queryFn: () => getPublicGroupCoachingDetail({ id: eventId }),
    queryKey: [queryKeys.publicExpertGroupCoachingDetails, eventId],
    enabled: !!eventId,
  });

  const eventDetails = response?.data?.data || {};

  const handlePublicBuyNow = () => {
    if (isGeoLoading) {
      toast.info('Detecting your location...');
      return;
    }

    if (!isDev && (!countryCode || !ALLOWED_COUNTRIES.includes(countryCode))) {
      toast.error('We currently only support purchases from the United States, Canada, and India.');
      return;
    }

    router.push(`/payment/guest/group_coaching/${eventId}`);
  };

  return (
    <GroupCoachingDetails
      isLoading={isLoading}
      eventDetails={eventDetails}
      eventId={eventId}
      isPublicView={true}
      handlePublicBuyNow={handlePublicBuyNow}
      guestCheckoutLoading={isGeoLoading}
    />
  );
};

export default PublicGroupCoachingDetails;
