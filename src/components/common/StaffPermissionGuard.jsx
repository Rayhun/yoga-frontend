'use client';
import React from 'react';
import useAuthContext from '@/hooks/useAuthContext';

const StaffPermissionGuard = ({ children, fallback = null }) => {
  const { user } = useAuthContext();

  // If user is staff, hide the content (show fallback)
  if (user?.isStaff) {
    return fallback;
  }

  // If user is not staff, render children
  return children;
};

export default StaffPermissionGuard;
