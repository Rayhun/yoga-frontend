import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getExpertGroupCoachingList } from '@/services/private/customer/groupCoaching';
import queryKeys from '@/utils/query-keys';
import UserProfileGroupCoaching from '@/components/common/user/profile/groupCoaching';

const ExpertProfileGroupCoaching = () => {
  const params = useParams();
  const { id } = params;
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const { isFetching: isLoadingCoachings, data: coachingResponse } = useQuery({
    queryFn: () => getExpertGroupCoachingList({ id }),
    queryKey: [queryKeys.expertGroupCoaching, id],
  });

  const filteredCoachings = useMemo(
    () =>
      (coachingResponse?.data?.results?.data?.['all-events'] || []).filter(event =>
        event.title.includes(searchText)
      ),
    [coachingResponse?.data?.results?.data, searchText]
  );

  return (
    <UserProfileGroupCoaching
      filteredCoachings={filteredCoachings}
      isLoadingCoachings={isLoadingCoachings}
      searchText={searchText}
      setSearchText={setSearchText}
      onClickEvent={event => router.push(`/portal/customer/group_coaching/${event.id}/details`)}
      isPublicView={true}
    />
  );
};

export default ExpertProfileGroupCoaching;
