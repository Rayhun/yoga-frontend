import { useMemo, useState } from 'react';
import { getExpertProgramsList } from '@/services/private/expert/program';
import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/utils/query-keys';
import { useRouter } from 'next/navigation';
import UserProfilePrograms from '@/components/common/user/profile/programs';

const ExpertProfilePrograms = () => {
  const router = useRouter();

  // const { isOpen: isFilterModalOpen, toggle: toggleFilterModal } = useToggle();
  const [searchText, setSearchText] = useState('');

  const { isFetching: isLoadingPrograms, data: programsResponse } = useQuery({
    queryFn: getExpertProgramsList,
    queryKey: [queryKeys.expertCustomerPrograms],
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
      onClickProgram={() => console.log(`Clicked ${program.title}`)}
    />
  );
};

export default ExpertProfilePrograms;
