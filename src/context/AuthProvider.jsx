'use client';
import { createContext, useEffect } from 'react';
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import { authenticateUser, updateUserTimezone } from '@/services/public/auth';
import FullScreenLoader from '@/components/common/loader/FullScreenLoader';
import queryKeys from '@/utils/query-keys';
import { USER_ROLE, USER_SUB_ROLE } from '@/utils/authorization';

const initialState = {
  user: {
    email: null,
    profile: {
      id: null,
      first_name: null,
      last_name: null,
      role: null,
      sub_role: null,
      profile_type: null,
      business_owner: null,
      employee_id: null,
    },
    isAdmin: false,
    isStaff: false,
    isCustomer: false,
    isIndividualCustomer: false,
    isBusinessCustomer: false,
    isBusinessOwner: false,
    isEmployee: false,
  },
  logout: () => {},
  hasPermission: () => false,
};

export const AuthContext = createContext(initialState);

function AuthProvider({ children }) {
  const token = Cookies.get('token');
  if (!token) redirect('/auth/login');

  const {
    data: userAuthenticationResponse,
    isLoading,
    isError,
  } = useQuery({
    queryFn: authenticateUser,
    queryKey: [queryKeys.loggedInUser],
  });

  useEffect(() => {
    if (!isLoading && !isError) {
      updateUserTimezone().catch(() => {});
    }
  }, [isLoading, isError]);

  if (isLoading) return <FullScreenLoader />;

  if (isError) redirect('/auth/login');

  const logout = () => {
    Cookies.remove('token');
    window.location.reload();
  };

  const userDetails = userAuthenticationResponse?.data || {};
  const userProfile = userDetails?.profile || {};

  // User Role Checks
  const isAdmin = userProfile?.role === USER_ROLE.ADMIN;
  const isStaff = userProfile?.role === USER_ROLE.STAFF;
  const isCustomer = userProfile?.role === USER_ROLE.CUSTOMER;
  const isAffiliate = userProfile?.role === USER_ROLE.AFFILIATE;
  const isIndividualCustomer = isCustomer && userProfile?.profile_type === USER_SUB_ROLE.INDIVIDUAL;
  const isBusinessCustomer = isCustomer && userProfile?.profile_type === USER_SUB_ROLE.BUSINESS;
  
  // B2B Business User Checks
  const isBusinessOwner = userProfile?.profile_type === USER_SUB_ROLE.BUSINESS && !userProfile?.business_owner;
  const isEmployee = userProfile?.profile_type === USER_SUB_ROLE.BUSINESS && !!userProfile?.business_owner;

  // Permission checking function
  const hasPermission = (permission) => {
    // Admins have all permissions
    if (isAdmin) {
      return true;
    }
    
    // Staff users have limited permissions - only view access to Programs, Modules, and Sessions
    if (isStaff) {
      // Define allowed permissions for staff users (view only, no add/edit/delete)
      const staffAllowedPermissions = [
        'program_view',
        'module_view', 
        'session_view',
        'expert_view',
        'user_view',
        'inbox_view',
        'home_access',
        'dashboard_view'
      ];
      
      // Explicitly deny all add/edit/delete permissions for staff
      const staffDeniedPermissions = [
        'program_add', 'program_edit', 'program_delete',
        'module_add', 'module_edit', 'module_delete',
        'session_add', 'session_edit', 'session_delete',
        'expert_add', 'expert_edit', 'expert_delete',
        'user_add', 'user_edit', 'user_delete',
        'manage_system_roles',
        'manage_permissions',
        'manage_staff_users'
      ];
      
      // If it's a denied permission, return false
      if (staffDeniedPermissions.includes(permission)) {
        return false;
      }
      
      // Check if the requested permission is in the allowed list
      return staffAllowedPermissions.includes(permission);
    }
    
    // For other roles, you can extend this to check actual user permissions from the backend
    // For now, return false for non-admin and non-staff users
    return false;
  };


  return (
    <AuthContext.Provider
      value={{
        user: { 
          ...userDetails, 
          isAdmin, 
          isStaff, 
          isCustomer, 
          isIndividualCustomer, 
          isBusinessCustomer, 
          isAffiliate,
          isBusinessOwner,
          isEmployee
        },
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
