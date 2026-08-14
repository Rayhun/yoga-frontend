'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import useAuthContext from '@/hooks/useAuthContext';
import CustomerDashboard from '@/components/dashboard/Customer';
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

    // Redirect if not a customer
    if (userRole !== 'Customer') {
      router.replace('/portal');
    }
  }, [userRole, router]);

  // Show loader while checking authentication or during SSR
  if (!isClient || !user || userRole !== 'Customer') {
    return <PageLoader />;
  }

  // Business customers see the business dashboard
  if (userSubRole === 'Business') {
    return <BusinessDashboard />;
  }

  // Individual customers see the general customer dashboard
  return <CustomerDashboard />;
}