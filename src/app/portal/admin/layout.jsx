'use client';
import { redirect } from 'next/navigation';
import useAuthContext from '@/hooks/useAuthContext';

const Layout = ({ children }) => {
  const {
    user: { isAdmin },
  } = useAuthContext();

  if (!isAdmin) redirect('/portal');

  return children;
};

export default Layout;
