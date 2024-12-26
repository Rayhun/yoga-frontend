import AuthProvider from '@/context/AuthProvider';
import DefaultLayout from '@/components/layouts/DefaultLayout';

const Layout = ({ children }) => {
  return (
    // <AuthProvider>
    <DefaultLayout>{children}</DefaultLayout>
    // </AuthProvider>
  );
};

export default Layout;
