'use client';
import CustomerDashboard from '@/components/dashboard/Customer';
import ECommerce from '@/components/dashboard/E-commerce/E-commerce';
import useAuthContext from '@/hooks/useAuthContext';

const ClientPortalPage = () => {
  const { user } = useAuthContext();
  const userRole = user?.profile?.role ?? '';

  const renderDashboard = () => {
    switch (userRole) {
      case 'Customer':
        return <CustomerDashboard />;
      default:
        return <ECommerce />;
    }
  };

  return userRole === '' ? null : renderDashboard();
};

export default ClientPortalPage;