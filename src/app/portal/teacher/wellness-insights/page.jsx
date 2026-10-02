'use client';

import PageLoader from '@/components/common/loader/PageLoader';
import ExpertWellnessInsights from '@/components/expert/WellnessInsights';
import useAuthContext from '@/hooks/useAuthContext';

export default function Page() {
  const { user } = useAuthContext();
  const userRole = user?.profile?.role ?? '';

  if (!user || userRole !== 'Teacher') {
    return <PageLoader />;
  }

  return <ExpertWellnessInsights />;
}
