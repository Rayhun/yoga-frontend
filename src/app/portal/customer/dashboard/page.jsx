'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import useAuthContext from '@/hooks/useAuthContext';
import PageLoader from '@/components/common/loader/PageLoader';

// Dynamically import BusinessDashboard to avoid SSR issues
const BusinessDashboard = dynamic(() => import('@/components/customer/BusinessDashboard'), {
  ssr: false,
  loading: () => <PageLoader />
});

export default function Page() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  const userRole = user?.profile?.role ?? '';
  const userSubRole = user?.profile?.sub_role ?? '';

  useEffect(() => {
    // Set client-side flag
    setIsClient(true);
    
    // Redirect if not a customer or not a business customer
    if (userRole !== 'Customer' || userSubRole !== 'Business') {
      router.replace('/portal');
    }
    
    // Business owners can access both regular dashboard and business dashboard
  }, [userRole, userSubRole, user?.isBusinessOwner, router]);

  // Show loader while checking authentication or during SSR
  if (!isClient || !user || userRole !== 'Customer') {
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
