'use client';
import React from 'react';
import useAuthContext from '@/hooks/useAuthContext';

const PermissionGuard = ({ permission, children, fallback = null, hideForStaff = false }) => {
  const { hasPermission, user } = useAuthContext();

  // If hideForStaff is true and user is staff, show fallback
  if (hideForStaff && user?.isStaff) {
    return fallback;
  }

  // If hasPermission function doesn't exist or user doesn't have permission, show fallback
  if (!hasPermission || !hasPermission(permission)) {
    return fallback;
  }

  // If user has permission, render children
  return children;
};

export default PermissionGuard;
