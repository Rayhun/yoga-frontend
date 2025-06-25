'use client';
import { createContext } from 'react';
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import { authenticateUser } from '@/services/public/auth';
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
    },
    isAdmin: false,
    isCustomer: false,
    isIndividualCustomer: false,
    isBusinessCustomer: false,
  },
  logout: () => {},
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
  const isCustomer = userProfile?.role === USER_ROLE.CUSTOMER;
  const isAffiliate = userProfile?.role === USER_ROLE.AFFILIATE;
  const isIndividualCustomer = isCustomer && userProfile?.sub_role === USER_SUB_ROLE.INDIVIDUAL;
  const isBusinessCustomer = isCustomer && userProfile?.sub_role === USER_SUB_ROLE.BUSINESS;

  return (
    <AuthContext.Provider
      value={{
        user: { ...userDetails, isAdmin, isCustomer, isIndividualCustomer, isBusinessCustomer, isAffiliate },
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
