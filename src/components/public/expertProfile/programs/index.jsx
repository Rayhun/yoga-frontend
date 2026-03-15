import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPublicPrograms } from '@/services/public/expert';
import queryKeys from '@/utils/query-keys';
import UserProfilePrograms from '@/components/common/user/profile/programs';

const PublicExpertPrograms = ({ expertId, tabEnabled = false }) => {
  const params = useParams();
  const router = useRouter();
  const username = params?.id;
  const [searchText, setSearchText] = useState('');

  const { isFetching: isLoadingPrograms, data: programsResponse } = useQuery({
    queryFn: () => getPublicPrograms({ id: expertId }),
    queryKey: [queryKeys.publicExpertPrograms, expertId],
    enabled: !!expertId && tabEnabled,
  });

  const filteredPrograms = useMemo(
    () =>
      (programsResponse?.data?.results?.data?.['all-programs'] || []).filter(program =>
        program.title.toLowerCase().includes(searchText.toLowerCase())
      ),
    [programsResponse?.data?.results?.data, searchText]
  );

  return (
    <UserProfilePrograms
      filteredPrograms={filteredPrograms}
      isLoadingPrograms={isLoadingPrograms}
      searchText={searchText}
      setSearchText={setSearchText}
      onClickProgram={program => router.push(`/expert/${username}/program/${program.id}/details`)}
      isPublicView={true}
    />
  );
};

export default PublicExpertPrograms;
