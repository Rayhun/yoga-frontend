'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Inbox from '@/components/inbox';
import useAuthContext from '@/hooks/useAuthContext';
import { USER_ROLE } from '@/utils/authorization';
import FullScreenLoader from '@/components/common/loader/FullScreenLoader';

const Page = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const isExpert = user?.profile?.role === USER_ROLE.TEACHER;
  const hasChatGroup = Boolean(user?.profile?.is_chat_group);

  useEffect(() => {
    if (isExpert && !hasChatGroup) {
      router.replace('/portal/teacher/community/create');
    }
  }, [isExpert, hasChatGroup, router]);

  if (isExpert && !hasChatGroup) {
    return <FullScreenLoader />;
  }

  return (
    <div className="inbox-height min-h-0 w-full overflow-hidden">
      <Inbox />
    </div>
  );
};

export default Page;
