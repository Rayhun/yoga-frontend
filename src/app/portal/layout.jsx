import AuthProvider from '@/context/AuthProvider';
import OnboardingGuard from '@/components/common/OnboardingGuard';
import { SidebarLayout } from '@/components/layouts';

export const metadata = {
  title: 'Dashboard',
};

const Layout = ({ children }) => {
  return (
    <AuthProvider>
      <OnboardingGuard>
        <SidebarLayout>{children}</SidebarLayout>
      </OnboardingGuard>
    </AuthProvider>
  );
};

export default Layout;
