import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getExpertGroupCoachingList } from '@/services/private/expert/groupCoaching';
import queryKeys from '@/utils/query-keys';
import UserProfileGroupCoaching from '@/components/common/user/profile/groupCoaching';
import FeaturedTypeFilter from '@/components/common/FeaturedTypeFilter';

const items = ['workshop', 'bootcamp', 'live event', 'masterclass'];

const ExpertProfileGroupCoaching = ({ tabEnabled = false }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState([]);
  const router = useRouter();

  const { isFetching: isLoadingCoachings, data: coachingResponse } = useQuery({
    queryFn: getExpertGroupCoachingList,
    queryKey: [queryKeys.expertGroupCoaching],
    enabled: tabEnabled,
  });

  const filteredCoachings = useMemo(
    () =>
      (coachingResponse?.data?.data || []).filter(
        event =>
          event.title.toLowerCase().includes(searchText.toLowerCase()) &&
          (selectedType.length === 0 || selectedType.includes(event.event_type))
      ),
    [coachingResponse?.data?.data, searchText, selectedType]
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
        onClickEvent={event => router.push(`/portal/teacher/group_coaching/${event.id}/details`)}
        isZoomConnected={coachingResponse?.data?.is_zoom_connected}
        isExpertView
      />
    </>
  );
};

export default ExpertProfileGroupCoaching;
