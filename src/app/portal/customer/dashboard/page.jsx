'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthContext from '@/hooks/useAuthContext';
import PageLoader from '@/components/common/loader/PageLoader';
import BusinessDashboard from '@/components/customer/BusinessDashboard';

export default function Page() {
  const { user } = useAuthContext();
  const router = useRouter();
  
  const userRole = user?.profile?.role ?? '';
  const userSubRole = user?.profile?.sub_role ?? '';

  useEffect(() => {
    // Redirect if not a customer or not a business customer
    if (userRole !== 'Customer' || userSubRole !== 'Business') {
      router.replace('/portal');
    }
    
    // Business owners can access both regular dashboard and business dashboard
  }, [userRole, userSubRole, user?.isBusinessOwner, router]);

  // Show loader while checking authentication
  if (!user || userRole !== 'Customer') {
    return <PageLoader />;
  }

  // Show loader if not a business customer (will redirect)
  if (userSubRole !== 'Business') {
    return <PageLoader />;
  }

  return (
    <div>
      <BusinessDashboard />
    </div>
  );
}
