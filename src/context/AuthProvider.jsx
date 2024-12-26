'use client';
import { createContext } from 'react';
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import { authenticateUser } from '@/services/public/auth';
import FullScreenLoader from '@/components/common/FullScreenLoader';
import queryKeys from '@/utils/query-keys';

const initialState = {
  user: {
    email: null,
    profile: {
      id: null,
      first_name: null,
      last_name: null,
      role: null,
    },
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

  return (
    <AuthContext.Provider value={{ user: { ...(userAuthenticationResponse?.data || {}) }, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
