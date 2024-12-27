import AuthProvider from '@/context/AuthProvider';
import { SidebarLayout } from '@/components/layouts';

const Layout = ({ children }) => {
  return (
    <AuthProvider>
      <SidebarLayout>{children}</SidebarLayout>
    </AuthProvider>
  );
};

export default Layout;
