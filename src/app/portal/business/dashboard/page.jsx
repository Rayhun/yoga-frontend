'use client';
import React from 'react';
import BusinessDashboard from '@/components/business/BusinessDashboard';
import useAuthContext from '@/hooks/useAuthContext';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

const BusinessDashboardPage = () => {
  const { user } = useAuthContext();

  useEffect(() => {
    // Redirect if user is not a business owner
    if (!user?.isBusinessOwner) {
      redirect('/portal/customer/dashboard');
    }
  }, [user]);

  // Show loading while checking user permissions
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not business owner
  if (!user.isBusinessOwner) {
    return null;
  }

  return <BusinessDashboard />;
};

export default BusinessDashboardPage;
