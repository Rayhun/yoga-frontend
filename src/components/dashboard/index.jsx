'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CustomerDashboard from '@/components/dashboard/Customer';
import ECommerce from '@/components/dashboard/E-commerce/E-commerce';
import ExpertQuickSteps from '@/components/expert/ExpertQuickSteps';
import useAuthContext from '@/hooks/useAuthContext';

const ClientPortalPage = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const userRole = user?.profile?.role ?? '';
  const isProfileComplete = user?.profile?.is_profile_complete ?? false;
  const hasEventOrConsult = user?.profile?.has_event_or_consult ?? false;
  const stripeOnboarded = user?.profile?.stripe_onboarded ?? false;

  useEffect(() => {
    // Redirect teachers to dashboard if all conditions are met
    if (userRole === 'Teacher' && isProfileComplete && hasEventOrConsult && stripeOnboarded) {
      router.replace('/portal/teacher/dashboard');
    }
  }, [userRole, isProfileComplete, hasEventOrConsult, stripeOnboarded, router]);

  const renderDashboard = () => {
    switch (userRole) {
      case 'Customer':
        return <CustomerDashboard />;
      case 'Teacher':
        // Show quick steps if any condition is not met
        if (!isProfileComplete || !hasEventOrConsult || !stripeOnboarded) {
          return <ExpertQuickSteps />;
        }
        // This should redirect to dashboard, but fallback just in case
        return <ExpertQuickSteps />;
      default:
        return <ECommerce />;
    }
  };

  return userRole === '' ? null : renderDashboard();
};

export default ClientPortalPage;