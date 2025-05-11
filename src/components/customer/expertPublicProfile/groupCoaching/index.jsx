import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getExpertGroupCoachingList } from '@/services/private/customer/groupCoaching';
import queryKeys from '@/utils/query-keys';
import UserProfileGroupCoaching from '@/components/common/user/profile/groupCoaching';
import FeaturedTypeFilter from '@/components/common/FeaturedTypeFilter';

const items = ['workshop', 'bootcamp', 'live event'];

const ExpertProfileGroupCoaching = () => {
  const params = useParams();
  const { id } = params;
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState([]); 

  const router = useRouter();

  const { isFetching: isLoadingCoachings, data: coachingResponse } = useQuery({
    queryFn: () => getExpertGroupCoachingList({ id }),
    queryKey: [queryKeys.customerExpertGroupCoaching, id],
  });

  const filteredCoachings = useMemo(
    () =>
      (coachingResponse?.data?.results?.data?.['all-events'] || []).filter(
        event =>
          event.title.toLowerCase().includes(searchText.toLowerCase()) &&
          (selectedType.length === 0 || selectedType.includes(event.event_type))
      ),
    [coachingResponse?.data?.results?.data?.['all-events'], searchText, selectedType]
  );

  return (
    <>
      <div className="flex items-center justify-center mb-4">
        <FeaturedTypeFilter items={items} selected={selectedType} setSelected={setSelectedType} />
      </div>
      <UserProfileGroupCoaching
        filteredCoachings={filteredCoachings}
        isLoadingCoachings={isLoadingCoachings}
        searchText={searchText}
        setSearchText={setSearchText}
        onClickEvent={event => router.push(`/portal/customer/group_coaching/${event.id}/details`)}
        isPublicView={true}
      />
    </>
  );
};

export default ExpertProfileGroupCoaching;
