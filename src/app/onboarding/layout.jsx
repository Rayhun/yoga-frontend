'use client';
import AuthProvider from '@/context/AuthProvider';
import NavbarLayout from '@/components/layouts/NavbarLayout';

const Layout = ({ children }) => {
  return (
    <AuthProvider>
      <NavbarLayout>{children}</NavbarLayout>
    </AuthProvider>
  );
};

export default Layout;
