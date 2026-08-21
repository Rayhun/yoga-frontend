'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
    // Redirect teachers to the new home dashboard once onboarding is complete
    if (userRole === 'Teacher' && isProfileComplete && hasEventOrConsult && stripeOnboarded) {
      router.replace('/portal/teacher/dashboard');
    }

    // Redirect Institution users to their dedicated dashboard
    if (userRole === 'Institution') {
      router.replace('/portal/institution/dashboard');
    }

    // Redirect staff users to programs page
    if (userRole === 'Staff') {
      router.replace('/portal/admin/lms/program');
    }

    // Redirect customers to their dedicated dashboard
    if (userRole === 'Customer') {
      router.replace('/portal/customer/dashboard');
    }

    // Redirect affiliate users to their dedicated dashboard
    if (userRole === 'Affiliate') {
      router.replace('/portal/affiliate/dashboard');
    }

    // Redirect admin users to admin dashboard
    if (userRole === 'Admin') {
      router.replace('/portal/admin/dashboard');
    }

    // Business owners and employees can access the regular portal
    // Business owners can also access the Business Dashboard via sidebar
    // Business employees have the same experience as individual users
  }, [userRole, isProfileComplete, hasEventOrConsult, stripeOnboarded, user?.isBusinessOwner, router]);

  const renderDashboard = () => {
    switch (userRole) {
      case 'Teacher':
        // Show quick steps if any condition is not met
        if (!isProfileComplete || !hasEventOrConsult || !stripeOnboarded) {
          return <ExpertQuickSteps />;
        }
        // This should redirect to dashboard, but fallback just in case
        return <ExpertQuickSteps />;
      case 'Customer':
      case 'Affiliate':
      case 'Staff':
      case 'Admin':
      case 'Institution':
        // These roles are handled by useEffect redirects above — show a
        // spinner while the navigation resolves to avoid a flash of wrong UI.
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Redirecting...</p>
            </div>
          </div>
        );
      default:
        return <ECommerce />;
    }
  };

  return userRole === '' ? null : renderDashboard();
};

export default ClientPortalPage;
