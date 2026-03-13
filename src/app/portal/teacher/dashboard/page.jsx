'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExpertDashboard from '@/components/expert/ExpertDashboard';
import useAuthContext from '@/hooks/useAuthContext';
import PageLoader from '@/components/common/loader/PageLoader';

export default function Page() {
  const { user } = useAuthContext();
  const router = useRouter();
  
  const isProfileComplete = user?.profile?.is_profile_complete ?? false;
  const hasEventOrConsult = user?.profile?.has_event_or_consult ?? false;
  const stripeOnboarded = user?.profile?.stripe_onboarded ?? false;
  const userRole = user?.profile?.role ?? '';

  useEffect(() => {
    // Redirect if not a teacher or any of the required conditions are not met
    if (userRole !== 'Teacher' || !isProfileComplete || !hasEventOrConsult || !stripeOnboarded) {
      router.replace('/portal');
    }
  }, [userRole, isProfileComplete, hasEventOrConsult, stripeOnboarded, router]);

  // Show loader while checking authentication
  if (!user || userRole !== 'Teacher') {
    return <PageLoader />;
  }

  // Show loader if any required condition is not met (will redirect)
  if (!isProfileComplete || !hasEventOrConsult || !stripeOnboarded) {
    return <PageLoader />;
  }

  return (
    <div>
      <ExpertDashboard />
    </div>
  );
}
