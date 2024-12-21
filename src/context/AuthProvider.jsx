'use client';
import { createContext, useCallback, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import { authenticateUser } from '@/services/public/auth';
import queryKeys from '@/utils/query-keys';
import { redirect } from 'next/navigation';

const initialState = {
  email: null,
  profile: {
    id: null,
    first_name: null,
    last_name: null,
  },
  logout: () => {},
};

export const AuthContext = createContext(initialState);

function AuthProvider({ children }) {
  const token = Cookies.get('token');
  const { data: userAuthenticationResponse } = useQuery({
    queryFn: authenticateUser,
    queryKey: [queryKeys.loggedInUser],
  });

  if (!token) redirect('/auth/login');

  const logout = useCallback(() => {
    Cookies.remove('token');
    window.location.reload();
  }, []);

  return (
    <AuthContext.Provider value={{ ...(userAuthenticationResponse?.data || {}), logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
