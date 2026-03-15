import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPublicGroupCoaching } from '@/services/public/expert';
import queryKeys from '@/utils/query-keys';
import UserProfileGroupCoaching from '@/components/common/user/profile/groupCoaching';
import FeaturedTypeFilter from '@/components/common/FeaturedTypeFilter';

const items = ['workshop', 'bootcamp', 'live event', 'masterclass'];

const PublicExpertGroupCoaching = ({ expertId, tabEnabled = false }) => {
  const params = useParams();
  const router = useRouter();
  const username = params?.id;
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState([]);

  const { isFetching: isLoadingCoachings, data: coachingResponse } = useQuery({
    queryFn: () => getPublicGroupCoaching({ id: expertId }),
    queryKey: [queryKeys.publicExpertGroupCoaching, expertId],
    enabled: !!expertId && tabEnabled,
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
        onClickEvent={event => router.push(`/expert/${username}/group_coaching/${event.id}/details`)}
        isPublicView={true}
      />
    </>
  );
};

export default PublicExpertGroupCoaching;
