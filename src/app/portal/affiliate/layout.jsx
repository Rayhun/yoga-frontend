'use client';
import { redirect } from 'next/navigation';
import useAuthContext from '@/hooks/useAuthContext';

const Layout = ({ children }) => {
  const {
    user: { isAffiliate },
  } = useAuthContext();

  if (!isAffiliate) redirect('/portal');

  return children;
};

export default Layout;
