import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import UserProfileConsultations from '@/components/common/user/profile/consultation';
import { getExpertProfileConsultationsList } from '@/services/private/customer/consultation';

const ExpertProfileConsultations = ({ tabEnabled = false }) => {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const { isFetching: isLoadingConsultations, data: consultationResponse } = useQuery({
    queryFn: () => getExpertProfileConsultationsList({ id }),
    queryKey: [queryKeys.expertProfileConsultations, id],
    enabled: !!id && tabEnabled,
  });

  const responseData = consultationResponse?.data?.results?.data;
  const consultations = useMemo(
    () => responseData?.['all-events'] || [],
    [responseData]
  );

  const filteredConsultations = useMemo(
    () =>
      consultations.filter(consult =>
        consult.title.includes(searchText)
      ),
    [consultations, searchText]
  );

  return (
    <UserProfileConsultations
      filteredConsultations={filteredConsultations}
      isLoadingConsultations={isLoadingConsultations}
      searchText={searchText}
      setSearchText={setSearchText}
      onClickConsultation={consultation =>
        router.push(`/portal/customer/lms/consultation/${consultation.id}/details`)
      }
    />
  );
};

export default ExpertProfileConsultations;
