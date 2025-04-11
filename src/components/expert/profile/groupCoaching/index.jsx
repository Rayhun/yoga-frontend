import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getExpertGroupCoachingList } from '@/services/private/expert/groupCoaching';
import queryKeys from '@/utils/query-keys';
import UserProfileGroupCoaching from '@/components/common/user/profile/groupCoaching';

const ExpertProfileGroupCoaching = () => {
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const { isFetching: isLoadingCoachings, data: coachingResponse } = useQuery({
    queryFn: getExpertGroupCoachingList,
    queryKey: [queryKeys.expertGroupCoaching],
  });

  const filteredCoachings = useMemo(
    () => (coachingResponse?.data?.data || []).filter(event => event.title.includes(searchText)),
    [coachingResponse?.data?.data, searchText]
  );

  return (
    <UserProfileGroupCoaching
      filteredCoachings={filteredCoachings}
      isLoadingCoachings={isLoadingCoachings}
      searchText={searchText}
      setSearchText={setSearchText}
      onClick={event => router.push(`/portal/teacher/group_coaching/${event.id}/details`)}
    />
  );
};

export default ExpertProfileGroupCoaching;
