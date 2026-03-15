import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPublicConsultations } from '@/services/public/expert';
import queryKeys from '@/utils/query-keys';
import UserProfileConsultations from '@/components/common/user/profile/consultation';

const PublicExpertConsultations = ({ expertId, tabEnabled = false }) => {
  const params = useParams();
  const router = useRouter();
  const username = params?.id;
  const [searchText, setSearchText] = useState('');

  const { isFetching: isLoadingConsultations, data: consultationResponse } = useQuery({
    queryFn: () => getPublicConsultations({ id: expertId }),
    queryKey: [queryKeys.publicExpertConsultations, expertId],
    enabled: !!expertId && tabEnabled,
  });

  const filteredConsultations = useMemo(
    () =>
      (consultationResponse?.data?.results?.data?.['all-events'] || []).filter(consult =>
        consult.title.toLowerCase().includes(searchText.toLowerCase())
      ),
    [consultationResponse?.data?.results?.data?.['all-events'], searchText]
  );

  return (
    <UserProfileConsultations
      filteredConsultations={filteredConsultations}
      isLoadingConsultations={isLoadingConsultations}
      searchText={searchText}
      setSearchText={setSearchText}
      onClickConsultation={consultation =>
        router.push(`/expert/${username}/consultation/${consultation.id}/details`)
      }
    />
  );
};

export default PublicExpertConsultations;
