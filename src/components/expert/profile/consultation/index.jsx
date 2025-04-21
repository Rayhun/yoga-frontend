import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getExpertConsultationsList } from '@/services/private/expert/consultation';
import queryKeys from '@/utils/query-keys';
import UserProfileConsultations from '@/components/common/user/profile/consultation';

const ExpertConsultations = ({ tabEnabled }) => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const { isFetching: isLoadingConsultations, data: consultationResponse } = useQuery({
    queryFn: getExpertConsultationsList,
    queryKey: [queryKeys.expertConsultations],
    enabled: tabEnabled,
  });

  const filteredConsultations = useMemo(
    () => (consultationResponse?.data?.data || []).filter(consult => consult.title.includes(searchText)),
    [consultationResponse?.data?.data, searchText]
  );

  return (
    <UserProfileConsultations
      filteredConsultations={filteredConsultations}
      isLoadingConsultations={isLoadingConsultations}
      searchText={searchText}
      setSearchText={setSearchText}
      onClickConsultation={consultation => router.push(`/portal/teacher/consultation/${consultation.id}/details`)}
      isExpertView
    />
  );
};

export default ExpertConsultations;
