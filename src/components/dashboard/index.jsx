'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CustomerDashboard from '@/components/dashboard/Customer';
import ECommerce from '@/components/dashboard/E-commerce/E-commerce';
import useAuthContext from '@/hooks/useAuthContext';

const ClientPortalPage = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const userRole = user?.profile?.role ?? '';

  useEffect(() => {
    // All teachers can access the new home dashboard
    if (userRole === 'Teacher') {
      router.replace('/portal/teacher/dashboard');
    }

    // Redirect staff users to programs page
    if (userRole === 'Staff') {
      router.replace('/portal/admin/lms/program');
    }
  }, [userRole, router]);

  const renderDashboard = () => {
    switch (userRole) {
      case 'Customer':
        return <CustomerDashboard />;
      case 'Teacher':
        return (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
              <p className="text-gray-600">Redirecting to dashboard...</p>
            </div>
          </div>
        );
      case 'Staff':
        return (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
              <p className="text-gray-600">Redirecting to programs...</p>
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
