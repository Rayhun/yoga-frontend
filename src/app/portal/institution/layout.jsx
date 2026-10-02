'use client';
import { redirect } from 'next/navigation';
import useAuthContext from '@/hooks/useAuthContext';

const Layout = ({ children }) => {
  const {
    user: { isInstitution },
  } = useAuthContext();

  if (!isInstitution) redirect('/portal');

  return children;
};

export default Layout;
