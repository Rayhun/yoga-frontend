'use client';
import CustomerDashboard from '@/components/dashboard/Customer';
import ECommerce from '@/components/dashboard/E-commerce/E-commerce';
import useAuthContext from '@/hooks/useAuthContext';

const Page = () => {
  const {user} = useAuthContext();
  const userRole = user?.profile?.role ?? ''; 
  const renderDashboard = () => {
    switch (userRole) {
      case 'Customer':
        return <CustomerDashboard />;
      default:
        return <ECommerce />;
    }
  };

  return renderDashboard();
};

export default Page;
