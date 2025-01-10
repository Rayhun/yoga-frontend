import NavbarLayout from '@/components/layouts/NavbarLayout';
import AuthProvider from '@/context/AuthProvider';

export const metadata = {
  title: 'Home',
};

const Layout = ({ children }) => {
  return (
    <AuthProvider>
      <NavbarLayout>{children}</NavbarLayout>
    </AuthProvider>
  );
};

export default Layout;
