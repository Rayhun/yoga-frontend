'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthContext from '@/hooks/useAuthContext';
import { USER_ROLE } from '@/utils/authorization';
import CreateCommunityCircleView from '@/components/inbox/community/CreateCommunityCircleView';
import FullScreenLoader from '@/components/common/loader/FullScreenLoader';

const Page = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const isExpert = user?.profile?.role === USER_ROLE.TEACHER;
  const hasChatGroup = Boolean(user?.profile?.is_chat_group);

  useEffect(() => {
    if (!isExpert) {
      router.replace('/portal/inbox');
      return;
    }
    if (hasChatGroup) {
      router.replace('/portal/inbox');
    }
  }, [isExpert, hasChatGroup, router]);

  if (!isExpert || hasChatGroup) {
    return <FullScreenLoader />;
  }

  return <CreateCommunityCircleView />;
};

export default Page;
