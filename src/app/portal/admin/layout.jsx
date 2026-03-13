'use client';
import { redirect } from 'next/navigation';
import useAuthContext from '@/hooks/useAuthContext';

const Layout = ({ children }) => {
  const {
    user: { isAdmin, isStaff },
  } = useAuthContext();

  if (!isAdmin && !isStaff) redirect('/portal');

  return children;
};

export default Layout;
