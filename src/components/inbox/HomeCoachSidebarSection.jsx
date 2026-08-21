'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getCommunityPage } from '@/services/private/customer/v2/community';
import queryKeys from '@/utils/query-keys';
import CoachProfileModal from './CoachProfileModal';
import HomeCircleSidebarCard from './HomeCircleSidebarCard';

export default function HomeCoachSidebarSection() {
  const router = useRouter();
  const [profileCoachId, setProfileCoachId] = useState(null);

  const { data: communityPageResponse } = useQuery({
    queryKey: [queryKeys.customerV2CommunityPage],
    queryFn: getCommunityPage,
    staleTime: 60_000,
  });

  const homeCircleCard = useMemo(() => {
    const sections = communityPageResponse?.data?.data || [];
    return sections.find(section => section?.component_id === 'home_circle_card');
  }, [communityPageResponse]);

  const handleMessage = ({ frontendUrl, conversationId } = {}) => {
    if (frontendUrl) {
      router.push(frontendUrl);
      return;
    }
    if (conversationId) {
      router.push(`/portal/inbox?conversation=${conversationId}`);
      return;
    }
    router.push('/portal/inbox');
  };

  const handleViewProfile = coachId => {
    setProfileCoachId(coachId);
  };

  return (
    <>
      <HomeCircleSidebarCard
        card={homeCircleCard}
        onMessage={handleMessage}
        onViewProfile={handleViewProfile}
      />
      <CoachProfileModal
        open={Boolean(profileCoachId)}
        coachId={profileCoachId}
        onClose={() => setProfileCoachId(null)}
      />
    </>
  );
}
