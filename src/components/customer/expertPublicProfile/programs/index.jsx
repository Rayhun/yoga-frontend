import { useMemo, useState } from 'react';
import { getExpertProgramsList } from '@/services/private/customer/program';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import { useParams, useRouter } from 'next/navigation';
import UserProfilePrograms from '@/components/common/user/profile/programs';

const ExpertProfilePrograms = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [searchText, setSearchText] = useState('');

  const { isFetching: isLoadingPrograms, data: programsResponse } = useQuery({
    queryFn: () => getExpertProgramsList({ id }),
    queryKey: [queryKeys.expertCustomerPrograms, id],
  });
  const filteredPrograms = useMemo(
    () =>
      (programsResponse?.data?.results?.data?.['all-programs'] || []).filter(program =>
        program.title.includes(searchText)
      ),
    [programsResponse?.data?.results?.data, searchText]
  );


  return (
    <UserProfilePrograms
      filteredPrograms={filteredPrograms}
      isLoadingPrograms={isLoadingPrograms}
      searchText={searchText}
      setSearchText={setSearchText}
      onClickProgram={program => router.push(`/portal/customer/lms/program/${program.id}/details`)}
      isPublicView={true}
    />
  );
};

export default ExpertProfilePrograms;
