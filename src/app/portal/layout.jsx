import AuthProvider from '@/context/AuthProvider';
import OnboardingGuard from '@/components/common/OnboardingGuard';
import SubscriptionGuard from '@/components/common/SubscriptionGuard';
import { SidebarLayout } from '@/components/layouts';

export const metadata = {
  title: 'Dashboard',
};

const Layout = ({ children }) => {
  return (
    <AuthProvider>
      <OnboardingGuard>
        <SubscriptionGuard>
          <SidebarLayout>{children}</SidebarLayout>
        </SubscriptionGuard>
      </OnboardingGuard>
    </AuthProvider>
  );
};

export default Layout;
